import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { compressAndConvertToWebP } from './imageOptimizer';
import type { ProductItem, SalesRecord, Category, Material } from './types';
import type { CashClosureRecord } from './cashClosureManager';

// Store ID for Salsipuedes (Isla 1) - Hardcoded for prototype purposes based on Prisma Seed
const STORE_ID = 'store-salsipuedes-isla';

// Helper to generate a valid RFC4122 v4 UUID
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function useSupabaseCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) {
        console.error('Error fetching categories from Supabase:', error);
        return;
      }
      if (data) {
        setCategories(data as Category[]);
      }
    } catch (e) {
      console.error('Unexpected error fetching categories:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, loading, fetchCategories };
}

export function useSupabaseMaterials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase.from('materials').select('*').order('name');
      if (error) {
        console.error('Error fetching materials from Supabase:', error);
        return;
      }
      if (data) {
        setMaterials(data as Material[]);
      }
    } catch (e) {
      console.error('Unexpected error fetching materials:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  return { materials, loading, fetchMaterials };
}

export function useSupabaseProducts() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      // Fetch products, categories, materials, inventory stock, and product images
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          material:materials(*),
          inventory:inventories(quantity, storeId),
          images:product_images(*)
        `)
        .eq('active', true);

      if (error) {
        console.error('Error fetching products from Supabase:', error);
        return;
      }

      if (data) {
        const defaultImageMap: Record<string, string> = {
          'AN-PO-000001': '/images/ring_silver_gold.png',
          'CD-PL-000002': '/images/chain_silver.png',
        };

        const formatted: ProductItem[] = data.map((p: any) => {
          const inv = p.inventory?.find((i: any) => i.storeId === STORE_ID);
          const stock = inv ? inv.quantity : 0;
          const imageUrl = p.images?.find((img: any) => img.isPrimary)?.url || p.images?.[0]?.url || defaultImageMap[p.code];

          return {
            id: p.id,
            code: p.code,
            name: p.name,
            description: p.description || '',
            priceList: Number(p.priceList),
            priceCash: Number(p.priceCash),
            category: p.category as Category,
            material: p.material as Material,
            image: imageUrl,
            stock: stock,
            inStock: stock > 0,
          };
        });
        setProducts(formatted);
      }
    } catch (e) {
      console.error('Unexpected error fetching products:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    const invChannelId = `inventories_sub_${generateUUID()}`;
    const prodChannelId = `products_sub_${generateUUID()}`;

    const inventorySubscription = supabase
      .channel(invChannelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventories' },
        () => {
          fetchProducts();
        }
      )
      .subscribe();

    const productSubscription = supabase
      .channel(prodChannelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(inventorySubscription);
      supabase.removeChannel(productSubscription);
    };
  }, []);

  return { products, loading, fetchProducts };
}

const PAYMENT_METHOD_TO_DB: Record<string, string> = {
  EFECTIVO: 'CASH',
  TRANSFERENCIA: 'TRANSFER',
  FISERV_CREDITO: 'CREDIT_CARD',
  FISERV_DEBITO: 'DEBIT_CARD',
  MERCADOPAGO: 'MERCADO_PAGO',
  CASH: 'CASH',
  TRANSFER: 'TRANSFER',
  CREDIT_CARD: 'CREDIT_CARD',
  DEBIT_CARD: 'DEBIT_CARD',
  MERCADO_PAGO: 'MERCADO_PAGO',
};

const PAYMENT_METHOD_FROM_DB: Record<string, string> = {
  CASH: 'EFECTIVO',
  TRANSFER: 'TRANSFERENCIA',
  CREDIT_CARD: 'FISERV_CREDITO',
  DEBIT_CARD: 'FISERV_DEBITO',
  MERCADO_PAGO: 'MERCADOPAGO',
};

export function useSupabaseSales() {
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSales = async () => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          id,
          createdAt,
          totalAmount,
          paymentMethod,
          items:sale_items(
            quantity,
            product:products(name, code)
          )
        `)
        .order('createdAt', { ascending: false });

      if (error) {
        console.error('Error fetching sales from Supabase:', error);
        return;
      }

      if (data) {
        const flatSales: SalesRecord[] = [];
        data.forEach((sale: any) => {
          sale.items?.forEach((item: any) => {
            flatSales.push({
              id: sale.id,
              productName: item.product?.name || 'Producto Desconocido',
              productCode: item.product?.code || 'SKU-???',
              quantity: item.quantity,
              paymentMethod: PAYMENT_METHOD_FROM_DB[sale.paymentMethod] || sale.paymentMethod,
              totalAmount: Number(sale.totalAmount),
              date: `Hoy ${new Date(sale.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs`,
              timestamp: new Date(sale.createdAt).getTime(),
            });
          });
        });
        
        flatSales.sort((a, b) => b.timestamp - a.timestamp);
        setSales(flatSales);
      }
    } catch (e) {
      console.error('Unexpected error fetching sales:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();

    const salesChannelId = `sales_sub_${generateUUID()}`;
    const salesSubscription = supabase
      .channel(salesChannelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sales' },
        () => {
          fetchSales();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(salesSubscription);
    };
  }, []);

  return { sales, loading, fetchSales };
}

// --- Write Helpers ---

export async function registerSupabaseSale(saleData: {
  productId: string;
  quantity: number;
  totalAmount: number;
  paymentMethod: string;
  userId?: string;
}) {
  const dbPaymentMethod = PAYMENT_METHOD_TO_DB[saleData.paymentMethod] || 'CASH';
  const now = new Date().toISOString();
  const saleId = generateUUID();
  const validUserId = saleData.userId && isValidUUID(saleData.userId) ? saleData.userId : null;

  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .insert({
      id: saleId,
      saleNumber: `VTA-${Date.now()}`,
      storeId: STORE_ID,
      userId: validUserId,
      totalAmount: saleData.totalAmount,
      paymentMethod: dbPaymentMethod,
      status: 'COMPLETED',
      updatedAt: now,
    })
    .select()
    .single();

  if (saleError || !sale) {
    console.error('Error creating sale in Supabase:', saleError);
    return false;
  }

  const itemId = generateUUID();

  const { error: itemError } = await supabase
    .from('sale_items')
    .insert({
      id: itemId,
      saleId: sale.id,
      productId: saleData.productId,
      quantity: saleData.quantity,
      unitPrice: saleData.totalAmount / saleData.quantity,
      subtotal: saleData.totalAmount
    });

  if (itemError) {
    console.error('Error creating sale item in Supabase:', itemError);
    return false;
  }

  // Update inventory
  const { data: inv } = await supabase
    .from('inventories')
    .select('id, quantity')
    .eq('productId', saleData.productId)
    .eq('storeId', STORE_ID)
    .single();

  if (inv) {
    await supabase
      .from('inventories')
      .update({ quantity: Math.max(0, inv.quantity - saleData.quantity), updatedAt: now })
      .eq('id', inv.id);
  }

  return true;
}

export async function uploadProductImage(file: File, productCode: string): Promise<string | null> {
  try {
    // Compress and convert image to WebP format
    const compressedFile = await compressAndConvertToWebP(file, {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.82,
    });

    const isWebP = compressedFile.type === 'image/webp';
    const fileExt = isWebP ? 'webp' : (compressedFile.name.split('.').pop() || 'jpg');
    const fileName = `${productCode.toLowerCase()}-${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, compressedFile, {
        cacheControl: '31536000',
        upsert: true,
        contentType: compressedFile.type,
      });

    if (uploadError) {
      console.error('Error uploading image to Supabase Storage:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (e) {
    console.error('Unexpected error during image upload:', e);
    return null;
  }
}

export async function registerSupabaseProduct(productData: {
  code: string;
  name: string;
  description?: string;
  priceList: number;
  priceCash: number;
  categoryId: string;
  materialId: string;
  stock: number;
  image?: string;
}) {
  const now = new Date().toISOString();
  const prodId = generateUUID();

  const { data: prod, error: prodError } = await supabase
    .from('products')
    .insert({
      id: prodId,
      code: productData.code,
      name: productData.name,
      description: productData.description || '',
      priceList: productData.priceList,
      priceCash: productData.priceCash,
      categoryId: productData.categoryId,
      materialId: productData.materialId,
      active: true,
      updatedAt: now,
    })
    .select()
    .single();

  if (prodError || !prod) {
    console.error('Error creating product in Supabase:', prodError);
    return false;
  }

  const invId = generateUUID();

  const { error: invError } = await supabase
    .from('inventories')
    .insert({
      id: invId,
      productId: prod.id,
      storeId: STORE_ID,
      quantity: productData.stock,
      minStock: 1,
      updatedAt: now,
    });

  if (invError) {
    console.error('Error creating inventory in Supabase:', invError);
    return false;
  }

  if (productData.image && productData.image.trim()) {
    const imgId = generateUUID();
    const { error: imgError } = await supabase
      .from('product_images')
      .insert({
        id: imgId,
        url: productData.image.trim(),
        isPrimary: true,
        productId: prod.id,
        createdAt: now,
      });

    if (imgError) {
      console.error('Error creating product image in Supabase:', imgError);
    }
  }

  return true;
}

export async function registerSupabaseCashClosure(record: any) {
  const closureId = isValidUUID(record.id) ? record.id : generateUUID();
  const { error } = await supabase
    .from('cash_closures')
    .insert({
      id: closureId,
      closureNumber: record.closureNumber,
      closedBy: record.closedBy,
      totalAmount: record.totalAmount,
      totalTransactions: record.totalTransactions,
      metadata: record,
      status: 'CLOSED'
    });
    
  if (error) {
    console.error('Error saving cash closure to Supabase:', error);
    return false;
  }
  return true;
}

export async function updateSupabaseCashClosureStatus(closureId: string, status: 'CLOSED' | 'REOPENED') {
  const { error } = await supabase
    .from('cash_closures')
    .update({ status })
    .eq('id', closureId);

  if (error) {
    console.error('Error updating cash closure status in Supabase:', error);
    return false;
  }
  return true;
}

export function useSupabaseCashClosures() {
  const [closures, setClosures] = useState<CashClosureRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClosures = async () => {
    try {
      const { data, error } = await supabase
        .from('cash_closures')
        .select('*')
        .order('closedAt', { ascending: false });

      if (error) {
        console.error('Error fetching closures:', error);
        return;
      }

      if (data) {
        const records: CashClosureRecord[] = data.map((row: any) => {
          const rawClosedAt = row.closedAt || row.metadata?.closedAt;
          const closedAtNum = typeof rawClosedAt === 'number'
            ? rawClosedAt
            : (rawClosedAt ? new Date(rawClosedAt).getTime() : Date.now());

          const numTotalAmount = row.totalAmount !== undefined && row.totalAmount !== null
            ? Number(row.totalAmount)
            : Number(row.metadata?.totalAmount || 0);

          const totalTrans = row.totalTransactions !== undefined && row.totalTransactions !== null
            ? Number(row.totalTransactions)
            : Number(row.metadata?.totalTransactions || 0);

          const formattedDateStr = row.metadata?.formattedDate || new Date(closedAtNum).toLocaleDateString('es-AR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return {
            sales: [],
            byMethod: {},
            ...row.metadata,
            id: row.id,
            closureNumber: row.closureNumber || row.metadata?.closureNumber || `CIERRE-${row.id.substring(0, 8)}`,
            closedBy: row.closedBy || row.metadata?.closedBy || 'Operador',
            closedAt: closedAtNum,
            formattedDate: formattedDateStr,
            totalAmount: isNaN(numTotalAmount) ? 0 : numTotalAmount,
            totalTransactions: isNaN(totalTrans) ? 0 : totalTrans,
            status: row.status || row.metadata?.status || 'CLOSED',
            reopenCount: row.reopenCount || row.metadata?.reopenCount || 0
          };
        });
        setClosures(records);
      }
    } catch (e) {
      console.error('Error in fetchClosures:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClosures();

    const closureChannelId = `cash_closures_sub_${generateUUID()}`;
    const closureSub = supabase
      .channel(closureChannelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cash_closures' }, () => {
        fetchClosures();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(closureSub);
    };
  }, []);

  return { closures, loading, fetchClosures };
}
