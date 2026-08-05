import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { compressAndConvertToWebP } from './imageOptimizer';
import type { ProductItem, SalesRecord, Category, Material, ExpenseRecord, ExpenseCategory, SiteBanner, StoreSetting } from './types';
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

  const fetchCategories = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchCategories();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchCategories]);

  return { categories, loading, fetchCategories };
}

export function useSupabaseMaterials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMaterials = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchMaterials();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchMaterials]);

  return { materials, loading, fetchMaterials };
}

export function useSupabaseProducts() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
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

        const formatted: ProductItem[] = (data as unknown as Record<string, unknown>[]).map((p) => {
          const invList = (p.inventory as Record<string, unknown>[]) || [];
          const inv = invList.find((i) => i.storeId === STORE_ID);
          const stock = inv && typeof inv.quantity === 'number' ? inv.quantity : 0;
          const imgList = (p.images as Record<string, unknown>[]) || [];
          const imageUrl = (imgList.find((img) => img.isPrimary)?.url as string) || (imgList[0]?.url as string) || defaultImageMap[String(p.code)];

          return {
            id: String(p.id),
            code: String(p.code),
            name: String(p.name),
            description: String(p.description || ''),
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
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchProducts();
    }, 0);

    const invChannelId = `inventories_sub_${generateUUID()}`;
    const prodChannelId = `products_sub_${generateUUID()}`;

    const inventorySubscription = supabase
      .channel(invChannelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventories' },
        () => {
          void fetchProducts();
        }
      )
      .subscribe();

    const productSubscription = supabase
      .channel(prodChannelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          void fetchProducts();
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(inventorySubscription);
      supabase.removeChannel(productSubscription);
    };
  }, [fetchProducts]);

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

  const fetchSales = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          id,
          createdAt,
          totalAmount,
          paymentMethod,
          channel,
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
        (data as unknown as Record<string, unknown>[]).forEach((sale) => {
          const itemsList = (sale.items as Record<string, unknown>[]) || [];
          itemsList.forEach((item) => {
            const productObj = item.product as Record<string, unknown> | undefined;
            flatSales.push({
              id: String(sale.id),
              productName: String(productObj?.name || 'Producto Desconocido'),
              productCode: String(productObj?.code || 'SKU-???'),
              quantity: Number(item.quantity || 0),
              paymentMethod: PAYMENT_METHOD_FROM_DB[String(sale.paymentMethod)] || String(sale.paymentMethod),
              totalAmount: Number(sale.totalAmount || 0),
              date: `Hoy ${new Date(String(sale.createdAt)).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs`,
              timestamp: new Date(String(sale.createdAt)).getTime(),
              rawDate: String(sale.createdAt),
              channel: (sale.channel as 'POS' | 'ONLINE') || 'POS',
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
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchSales();
    }, 0);

    const salesChannelId = `sales_sub_${generateUUID()}`;
    const salesSubscription = supabase
      .channel(salesChannelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sales' },
        () => {
          void fetchSales();
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(salesSubscription);
    };
  }, [fetchSales]);

  return { sales, loading, fetchSales };
}

// --- Write Helpers ---

export async function registerSupabaseSale(saleData: {
  productId: string;
  quantity: number;
  totalAmount: number;
  paymentMethod: string;
  userId?: string;
  channel?: 'POS' | 'ONLINE';
  transactionId?: string;
}) {
  const dbPaymentMethod = PAYMENT_METHOD_TO_DB[saleData.paymentMethod] || 'CASH';
  const now = new Date().toISOString();
  const saleId = generateUUID();
  const validUserId = saleData.userId && isValidUUID(saleData.userId) ? saleData.userId : null;
  const saleChannel = saleData.channel || 'POS';

  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .insert({
      id: saleId,
      saleNumber: `VTA-${Date.now()}`,
      storeId: STORE_ID,
      userId: validUserId,
      totalAmount: saleData.totalAmount,
      paymentMethod: dbPaymentMethod,
      channel: saleChannel,
      status: 'COMPLETED',
      updatedAt: now,
    })
    .select()
    .single();

  if (saleError || !sale) {
    console.error('Error creating sale in Supabase:', saleError);
    return false;
  }

  // Create transaction record in payments table
  const paymentId = generateUUID();
  const { error: payError } = await supabase
    .from('payments')
    .insert({
      id: paymentId,
      saleId: sale.id,
      paymentNumber: `PAY-${Date.now()}`,
      provider: saleData.paymentMethod,
      amount: saleData.totalAmount,
      status: 'APPROVED',
      installments: 1,
      transactionId: saleData.transactionId || null,
      createdAt: now,
    });

  if (payError) {
    console.warn('Notice inserting into payments table (running in compatibility mode):', payError);
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

export async function registerSupabaseCashClosure(record: CashClosureRecord | Record<string, unknown>) {
  const closureId = isValidUUID(String(record.id)) ? String(record.id) : generateUUID();
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

  const fetchClosures = useCallback(async () => {
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
        const records: CashClosureRecord[] = (data as unknown as Record<string, unknown>[]).map((row) => {
          const rowMetadata = (row.metadata as Record<string, unknown>) || {};
          const rawClosedAt = row.closedAt || rowMetadata.closedAt;
          const closedAtNum = typeof rawClosedAt === 'number'
            ? rawClosedAt
            : (rawClosedAt ? new Date(String(rawClosedAt)).getTime() : Date.now());

          const numTotalAmount = row.totalAmount !== undefined && row.totalAmount !== null
            ? Number(row.totalAmount)
            : Number(rowMetadata.totalAmount || 0);

          const totalTrans = row.totalTransactions !== undefined && row.totalTransactions !== null
            ? Number(row.totalTransactions)
            : Number(rowMetadata.totalTransactions || 0);

          const formattedDateStr = (rowMetadata.formattedDate as string) || new Date(closedAtNum).toLocaleDateString('es-AR', {
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
            ...rowMetadata,
            id: String(row.id),
            closureNumber: String(row.closureNumber || rowMetadata.closureNumber || `CIERRE-${String(row.id).substring(0, 8)}`),
            closedBy: String(row.closedBy || rowMetadata.closedBy || 'Operador'),
            closedAt: closedAtNum,
            formattedDate: formattedDateStr,
            totalAmount: isNaN(numTotalAmount) ? 0 : numTotalAmount,
            totalTransactions: isNaN(totalTrans) ? 0 : totalTrans,
            status: (row.status || rowMetadata.status || 'CLOSED') as 'CLOSED' | 'REOPENED',
            reopenCount: Number(row.reopenCount || rowMetadata.reopenCount || 0)
          };
        });
        setClosures(records);
      }
    } catch (e) {
      console.error('Error in fetchClosures:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchClosures();
    }, 0);

    const closureChannelId = `cash_closures_sub_${generateUUID()}`;
    const closureSub = supabase
      .channel(closureChannelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cash_closures' }, () => {
        void fetchClosures();
      })
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(closureSub);
    };
  }, [fetchClosures]);

  return { closures, loading, fetchClosures };
}

export async function updateSupabaseProductStock(productId: string, newQuantity: number): Promise<boolean> {
  try {
    const now = new Date().toISOString();
    const qty = Math.max(0, Math.round(newQuantity));

    const { data: inv } = await supabase
      .from('inventories')
      .select('id')
      .eq('productId', productId)
      .eq('storeId', STORE_ID)
      .maybeSingle();

    if (inv) {
      const { error } = await supabase
        .from('inventories')
        .update({ quantity: qty, updatedAt: now })
        .eq('id', inv.id);

      if (error) {
        console.error('Error updating product stock in Supabase:', error);
        return false;
      }
    } else {
      const invId = generateUUID();
      const { error } = await supabase
        .from('inventories')
        .insert({
          id: invId,
          productId,
          storeId: STORE_ID,
          quantity: qty,
          minStock: 1,
          updatedAt: now,
        });

      if (error) {
        console.error('Error inserting product stock in Supabase:', error);
        return false;
      }
    }

    return true;
  } catch (e) {
    console.error('Unexpected error updating product stock:', e);
    return false;
  }
}

export async function deleteSupabaseProduct(productId: string): Promise<boolean> {
  try {
    const now = new Date().toISOString();

    // 1. Physically delete inventory rows for this product
    const { error: invError } = await supabase
      .from('inventories')
      .delete()
      .eq('productId', productId);

    if (invError) {
      console.warn('Warning deleting inventory row for product:', invError);
    }

    // 2. Physically delete product_images rows for this product
    const { error: imgError } = await supabase
      .from('product_images')
      .delete()
      .eq('productId', productId);

    if (imgError) {
      console.warn('Warning deleting product_images rows for product:', imgError);
    }

    // 3. Physically delete product row from products table
    const { error: prodError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (prodError) {
      console.warn('Physical hard delete failed (likely due to past sale_items history), falling back to soft delete:', prodError);
      
      // Fallback: Soft delete by setting active = false if hard delete is constrained by foreign keys
      const { error: softError } = await supabase
        .from('products')
        .update({ active: false, updatedAt: now })
        .eq('id', productId);

      if (softError) {
        console.error('Error soft deleting product in Supabase:', softError);
        return false;
      }
    }

    return true;
  } catch (e) {
    console.error('Unexpected error deleting product in Supabase:', e);
    return false;
  }
}

// --- EXPENSES & MONTHLY BALANCE HELPERS ---

export function useSupabaseExpenses() {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) {
        console.error('Error fetching expenses from Supabase:', error);
        return;
      }

      if (data) {
        const records: ExpenseRecord[] = (data as unknown as Record<string, unknown>[]).map((row) => {
          const rawDate = row.date || row.createdAt;
          const dateStr = typeof rawDate === 'string' ? rawDate : new Date(Number(rawDate) || Date.now()).toISOString();
          const timestamp = new Date(dateStr).getTime() || Date.now();
          const monthKey = (row.monthKey as string) || dateStr.substring(0, 7);

          return {
            id: String(row.id),
            category: (row.category || 'VARIABLE') as ExpenseCategory,
            description: String(row.description || 'Gasto registrado'),
            amount: Number(row.amount || 0),
            date: dateStr,
            timestamp,
            monthKey,
            storeId: String(row.storeId || STORE_ID),
            receiptUrl: (row.receiptUrl as string) || undefined,
          };
        });
        setExpenses(records);
      }
    } catch (e) {
      console.error('Unexpected error fetching expenses:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchExpenses();
    }, 0);

    const expenseChannelId = `expenses_sub_${generateUUID()}`;
    const expenseSub = supabase
      .channel(expenseChannelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
        void fetchExpenses();
      })
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(expenseSub);
    };
  }, [fetchExpenses]);

  return { expenses, loading, fetchExpenses };
}

export async function registerSupabaseExpense(expenseData: {
  category: ExpenseCategory;
  description: string;
  amount: number;
  date?: string;
  monthKey?: string;
  receiptUrl?: string;
}): Promise<boolean> {
  try {
    const now = new Date();
    const dateStr = expenseData.date || now.toISOString();
    const monthKey = expenseData.monthKey || dateStr.substring(0, 7);
    const expenseId = generateUUID();

    const { error } = await supabase
      .from('expenses')
      .insert({
        id: expenseId,
        category: expenseData.category,
        description: expenseData.description,
        amount: expenseData.amount,
        date: dateStr,
        monthKey,
        storeId: STORE_ID,
        receiptUrl: expenseData.receiptUrl || null,
        createdAt: now.toISOString(),
      });

    if (error) {
      console.error('Error inserting expense in Supabase:', error);
      return false;
    }

    return true;
  } catch (e) {
    console.error('Unexpected error registering expense:', e);
    return false;
  }
}

export async function deleteSupabaseExpense(expenseId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    if (error) {
      console.error('Error deleting expense in Supabase:', error);
      return false;
    }

    return true;
  } catch (e) {
    console.error('Unexpected error deleting expense:', e);
    return false;
  }
}

/**
 * Helper function prepared for WhatsApp bot or external API integrations.
 * Formats a ready-to-send summary message for WhatsApp.
 */
export async function getMonthlySummaryForBot(targetMonthKey?: string) {
  const monthKey = targetMonthKey || new Date().toISOString().substring(0, 7);

  // Fetch sales for target month
  const { data: salesData } = await supabase
    .from('sales')
    .select('totalAmount, paymentMethod, createdAt')
    .gte('createdAt', `${monthKey}-01T00:00:00.000Z`)
    .lte('createdAt', `${monthKey}-31T23:59:59.999Z`);

  // Fetch expenses for target month
  const { data: expensesData } = await supabase
    .from('expenses')
    .select('amount, category')
    .eq('monthKey', monthKey);

  const totalSales = (salesData || []).reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
  const totalExpenses = (expensesData || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const netBalance = totalSales - totalExpenses;

  const expensesByCategory = {
    PROVEEDOR: 0,
    SUELDO: 0,
    ALQUILER: 0,
    VARIABLE: 0,
  };

  (expensesData || []).forEach((e) => {
    const cat = (e.category || 'VARIABLE') as keyof typeof expensesByCategory;
    if (expensesByCategory[cat] !== undefined) {
      expensesByCategory[cat] += Number(e.amount) || 0;
    }
  });

  const formattedWhatsAppText = `*REPORTE DE NEGOCIO - LAURE JOYAS* 💎\n` +
    `📅 *Mes:* ${monthKey}\n\n` +
    `💵 *Ingresos Totales:* $${totalSales.toLocaleString('es-AR')}\n` +
    `💸 *Egresos Totales:* $${totalExpenses.toLocaleString('es-AR')}\n` +
    `   • Proveedores: $${expensesByCategory.PROVEEDOR.toLocaleString('es-AR')}\n` +
    `   • Sueldos: $${expensesByCategory.SUELDO.toLocaleString('es-AR')}\n` +
    `   • Alquiler: $${expensesByCategory.ALQUILER.toLocaleString('es-AR')}\n` +
    `   • Variables: $${expensesByCategory.VARIABLE.toLocaleString('es-AR')}\n\n` +
    `📈 *BALANCE NETO:* $${netBalance.toLocaleString('es-AR')}`;

  return {
    monthKey,
    totalSales,
    totalExpenses,
    expensesByCategory,
    netBalance,
    formattedWhatsAppText,
  };
}

// --- User & Role Management Helpers ---

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER';
  createdAt: string;
}

export function useSupabaseUsers() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, createdAt')
        .order('createdAt', { ascending: false });

      if (error) {
        console.error('Error fetching users from Supabase:', error);
        return;
      }

      if (data) {
        setUsers(data as ManagedUser[]);
      }
    } catch (e) {
      console.error('Unexpected error fetching users:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchUsers();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  return { users, loading, fetchUsers };
}

export async function updateSupabaseUserRole(userId: string, newRole: 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER') {
  try {
    const { error } = await supabase
      .from('users')
      .update({ role: newRole, updatedAt: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user role in Supabase:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Unexpected error updating user role:', e);
    return false;
  }
}

// Default Fallback Banners when DB table is empty or offline
const DEFAULT_BANNERS: Record<string, string> = {
  hero_banner: '/images/hero_jewelry.png',
  alliance_banner: '/images/alliances_jewelry.png',
};

export function useSupabaseBanners() {
  const [banners, setBanners] = useState<Record<string, string>>(DEFAULT_BANNERS);
  const [loading, setLoading] = useState(true);

  const fetchBanners = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('site_banners').select('*');
      if (error) {
        console.warn('site_banners table not queried or empty, using defaults:', error.message);
        return;
      }
      if (data && data.length > 0) {
        const bannerMap: Record<string, string> = { ...DEFAULT_BANNERS };
        data.forEach((b: SiteBanner) => {
          if (b.section && b.imageUrl) {
            bannerMap[b.section] = b.imageUrl;
          }
        });
        setBanners(bannerMap);
      }
    } catch (e) {
      console.error('Unexpected error fetching site_banners:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchBanners();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchBanners]);

  return { banners, loading, fetchBanners };
}

export function useSupabaseStoreSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('store_settings').select('*');
      if (error) {
        console.warn('store_settings table not found, using defaults:', error.message);
        return;
      }
      if (data && data.length > 0) {
        const settingsMap: Record<string, string> = {};
        data.forEach((s: StoreSetting) => {
          if (s.key && s.value) {
            settingsMap[s.key] = s.value;
          }
        });
        setSettings(settingsMap);
      }
    } catch (e) {
      console.error('Unexpected error fetching store_settings:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchSettings();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchSettings]);

  return { settings, loading, fetchSettings };
}

export async function uploadBannerImage(file: File): Promise<string | null> {
  try {
    const webpFile = await compressAndConvertToWebP(file, { maxWidth: 1600, quality: 0.85 });
    const fileName = `banner_${Date.now()}.webp`;
    const filePath = `banners/${fileName}`;


    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, webpFile, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Error uploading banner to Supabase storage:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data?.publicUrl || null;
  } catch (e) {
    console.error('Unexpected error uploading banner image:', e);
    return null;
  }
}

export async function updateSupabaseBanner(section: string, title: string, imageUrl: string) {
  try {
    const { error } = await supabase
      .from('site_banners')
      .upsert(
        { section, title, imageUrl, updatedAt: new Date().toISOString() },
        { onConflict: 'section' }
      );

    if (error) {
      console.error('Error upserting site_banner in Supabase:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Unexpected error upserting site_banner:', e);
    return false;
  }
}


