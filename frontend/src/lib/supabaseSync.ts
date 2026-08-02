import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import type { ProductItem, SalesRecord, Category, Material } from './types';
import type { CashClosureRecord } from './cashClosureManager';

// Store ID for Salsipuedes (Isla 1) - Hardcoded for prototype purposes based on Prisma Seed
const STORE_ID = 'store-salsipuedes-isla';

export function useSupabaseProducts() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      // We need to fetch products, categories, materials, and inventory stock
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          material:materials(*),
          inventory:inventories(quantity, storeId)
        `)
        .eq('active', true);

      if (error) {
        console.error('Error fetching products from Supabase:', error);
        return;
      }

      if (data) {
        const formatted: ProductItem[] = data.map((p: any) => {
          // Find inventory for our store
          const inv = p.inventory?.find((i: any) => i.storeId === STORE_ID);
          const stock = inv ? inv.quantity : 0;

          return {
            id: p.id,
            code: p.code,
            name: p.name,
            description: p.description || '',
            priceList: Number(p.priceList),
            priceCash: Number(p.priceCash),
            category: p.category as Category,
            material: p.material as Material,
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

    // Subscribe to realtime changes on inventories table
    const inventorySubscription = supabase
      .channel('public:inventories')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventories' },
        (payload) => {
          // Re-fetch everything if stock changes to keep it simple and accurate
          fetchProducts();
        }
      )
      .subscribe();
      
    // Subscribe to product changes too (new products, price changes)
    const productSubscription = supabase
      .channel('public:products')
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
        // Flatten the sales (Supabase returns sale with items, our frontend expects flat items for history)
        const flatSales: SalesRecord[] = [];
        data.forEach((sale: any) => {
          // For prototype: If multiple items, we create a record for each, or consolidate.
          // Since our POS currently sells 1 type of product per transaction (based on how handlePOSSaleSuccess is built)
          sale.items?.forEach((item: any) => {
            flatSales.push({
              id: sale.id, // Using sale ID as grouping
              productName: item.product?.name || 'Producto Desconocido',
              productCode: item.product?.code || 'SKU-???',
              quantity: item.quantity,
              paymentMethod: sale.paymentMethod,
              totalAmount: Number(sale.totalAmount),
              date: `Hoy ${new Date(sale.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs`,
              timestamp: new Date(sale.createdAt).getTime(),
            });
          });
        });
        
        // Sort by timestamp desc
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

    const salesSubscription = supabase
      .channel('public:sales')
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
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .insert({
      saleNumber: `VTA-${Date.now()}`,
      storeId: STORE_ID,
      userId: saleData.userId || null,
      totalAmount: saleData.totalAmount,
      paymentMethod: saleData.paymentMethod,
      status: 'COMPLETED'
    })
    .select()
    .single();

  if (saleError || !sale) {
    console.error('Error creating sale:', saleError);
    return false;
  }

  const { error: itemError } = await supabase
    .from('sale_items')
    .insert({
      saleId: sale.id,
      productId: saleData.productId,
      quantity: saleData.quantity,
      unitPrice: saleData.totalAmount / saleData.quantity,
      subtotal: saleData.totalAmount
    });

  if (itemError) {
    console.error('Error creating sale item:', itemError);
    return false;
  }

  // Update inventory (Supabase RPC or just update directly)
  // For prototype, fetch current stock and deduct
  const { data: inv } = await supabase
    .from('inventories')
    .select('id, quantity')
    .eq('productId', saleData.productId)
    .eq('storeId', STORE_ID)
    .single();

  if (inv) {
    await supabase
      .from('inventories')
      .update({ quantity: Math.max(0, inv.quantity - saleData.quantity) })
      .eq('id', inv.id);
  }

  return true;
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
}) {
  const { data: prod, error: prodError } = await supabase
    .from('products')
    .insert({
      code: productData.code,
      name: productData.name,
      description: productData.description || '',
      priceList: productData.priceList,
      priceCash: productData.priceCash,
      categoryId: productData.categoryId,
      materialId: productData.materialId,
      active: true,
    })
    .select()
    .single();

  if (prodError || !prod) {
    console.error('Error creating product in Supabase:', prodError);
    return false;
  }

  const { error: invError } = await supabase
    .from('inventories')
    .insert({
      productId: prod.id,
      storeId: STORE_ID,
      quantity: productData.stock,
      minStock: 1,
    });

  if (invError) {
    console.error('Error creating inventory in Supabase:', invError);
    return false;
  }

  return true;
}


export async function registerSupabaseCashClosure(record: any) {
  const { error } = await supabase
    .from('cash_closures')
    .insert({
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
        // Map back to CashClosureRecord from JSON metadata
        const records: CashClosureRecord[] = data.map((row: any) => ({
          ...row.metadata,
          id: row.id, // Prefer db id or metadata id
          status: row.status,
          reopenCount: row.reopenCount
        }));
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

    const closureSub = supabase
      .channel('public:cash_closures')
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
