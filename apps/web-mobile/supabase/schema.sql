-- Create restaurants table
CREATE TABLE restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cuisine TEXT NOT NULL,
  prep_time TEXT NOT NULL,
  rating DECIMAL NOT NULL,
  distance TEXT NOT NULL,
  location TEXT NOT NULL,
  image TEXT NOT NULL,
  services JSONB NOT NULL DEFAULT '{"preBooking": true, "takeaway": true, "dineIn": true}'::jsonb
);

-- Create menu_items table
CREATE TABLE menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL,
  half_price DECIMAL,
  full_price DECIMAL,
  category TEXT NOT NULL,
  food_type TEXT NOT NULL,
  has_portions BOOLEAN DEFAULT FALSE,
  is_countable BOOLEAN DEFAULT FALSE,
  image TEXT
);

-- Create orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_type TEXT NOT NULL,
  total_amount DECIMAL NOT NULL,
  status TEXT DEFAULT 'pending',
  arrival_time TEXT,
  reservation_date TEXT,
  table_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create order_items table
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INTEGER NOT NULL,
  portion TEXT
);

-- RLS (Row Level Security)
-- Enable RLS on all tables
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access to restaurants and menu_items
CREATE POLICY "Allow public read access to restaurants" ON restaurants FOR SELECT USING (true);
CREATE POLICY "Allow public read access to menu_items" ON menu_items FOR SELECT USING (true);

-- Allow anonymous insert access to orders and order_items (since we don't have auth yet)
CREATE POLICY "Allow public insert to orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select to orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow public update to orders" ON orders FOR UPDATE USING (true);

CREATE POLICY "Allow public insert to order_items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select to order_items" ON order_items FOR SELECT USING (true);

ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS opening_hours TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS description TEXT;

-- Create profiles table for roles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'pending',
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
CREATE POLICY "Admins can update any profile" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Management Policies for Restaurants and Menu Items
CREATE POLICY "Admins can manage restaurants" ON restaurants
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage menu_items" ON menu_items
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

