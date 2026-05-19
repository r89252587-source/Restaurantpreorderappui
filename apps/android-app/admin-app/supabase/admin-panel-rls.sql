-- =========================================================
-- ADMIN PANEL RLS POLICIES
-- Apply this script in Supabase SQL Editor to enable 
-- management access for the Admin Panel.
-- =========================================================

-- 1. ENABLE RLS ON ALL TABLES
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. RESTAURANTS POLICIES
-- Allow everyone to view restaurants
DROP POLICY IF EXISTS "Allow public read access to restaurants" ON restaurants;
CREATE POLICY "Allow public read access to restaurants" ON restaurants 
  FOR SELECT USING (true);

-- Allow admins to manage (Insert, Update, Delete) restaurants
DROP POLICY IF EXISTS "Admins can manage restaurants" ON restaurants;
CREATE POLICY "Admins can manage restaurants" ON restaurants 
  FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));


-- 3. MENU ITEMS POLICIES
-- Allow everyone to view menu items
DROP POLICY IF EXISTS "Allow public read access to menu_items" ON menu_items;
CREATE POLICY "Allow public read access to menu_items" ON menu_items 
  FOR SELECT USING (true);

-- Allow admins to manage menu items
DROP POLICY IF EXISTS "Admins can manage menu_items" ON menu_items;
CREATE POLICY "Admins can manage menu_items" ON menu_items 
  FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));


-- 4. ORDERS POLICIES
-- Only admins can see and manage orders
DROP POLICY IF EXISTS "Admins can manage orders" ON orders;
CREATE POLICY "Admins can manage orders" ON orders 
  FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));


-- 5. PROFILES POLICIES
-- Admins can manage all profiles (to promote others or approve)
DROP POLICY IF EXISTS "Admins can manage profiles" ON profiles;
CREATE POLICY "Admins can manage profiles" ON profiles 
  FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles 
  FOR SELECT USING (auth.uid() = id);


-- =========================================================
-- EMERGENCY BYPASS (Run this if you can't log in at all)
-- =========================================================
-- UPDATE profiles SET role = 'admin' WHERE email = 'YOUR_EMAIL@EXAMPLE.COM';
