-- Migration: Enable RLS on all 13 Supabase tables with permissive dev policies
-- Target Database: laure-joyas-db (sa-east-1)

-- 1. public.users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for dev on users" ON public.users;
CREATE POLICY "Allow all for dev on users" ON public.users FOR ALL TO public USING (true) WITH CHECK (true);

-- 2. public.categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for dev on categories" ON public.categories;
CREATE POLICY "Allow all for dev on categories" ON public.categories FOR ALL TO public USING (true) WITH CHECK (true);

-- 3. public.materials
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for dev on materials" ON public.materials;
CREATE POLICY "Allow all for dev on materials" ON public.materials FOR ALL TO public USING (true) WITH CHECK (true);

-- 4. public.products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for dev on products" ON public.products;
CREATE POLICY "Allow all for dev on products" ON public.products FOR ALL TO public USING (true) WITH CHECK (true);

-- 5. public.product_images
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for dev on product_images" ON public.product_images;
CREATE POLICY "Allow all for dev on product_images" ON public.product_images FOR ALL TO public USING (true) WITH CHECK (true);

-- 6. public.stores
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for dev on stores" ON public.stores;
CREATE POLICY "Allow all for dev on stores" ON public.stores FOR ALL TO public USING (true) WITH CHECK (true);

-- 7. public.inventories
ALTER TABLE public.inventories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for dev on inventories" ON public.inventories;
CREATE POLICY "Allow all for dev on inventories" ON public.inventories FOR ALL TO public USING (true) WITH CHECK (true);

-- 8. public.sales
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for dev on sales" ON public.sales;
CREATE POLICY "Allow all for dev on sales" ON public.sales FOR ALL TO public USING (true) WITH CHECK (true);

-- 9. public.inventory_movements
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for dev on inventory_movements" ON public.inventory_movements;
CREATE POLICY "Allow all for dev on inventory_movements" ON public.inventory_movements FOR ALL TO public USING (true) WITH CHECK (true);

-- 10. public.sale_items
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for dev on sale_items" ON public.sale_items;
CREATE POLICY "Allow all for dev on sale_items" ON public.sale_items FOR ALL TO public USING (true) WITH CHECK (true);

-- 11. public.cash_closures
ALTER TABLE public.cash_closures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for dev on cash_closures" ON public.cash_closures;
CREATE POLICY "Allow all for dev on cash_closures" ON public.cash_closures FOR ALL TO public USING (true) WITH CHECK (true);

-- 12. public.expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for dev on expenses" ON public.expenses;
CREATE POLICY "Allow all for dev on expenses" ON public.expenses FOR ALL TO public USING (true) WITH CHECK (true);

-- 13. public.payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for dev on payments" ON public.payments;
CREATE POLICY "Allow all for dev on payments" ON public.payments FOR ALL TO public USING (true) WITH CHECK (true);
