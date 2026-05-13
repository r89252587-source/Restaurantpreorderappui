import { createClient } from '@supabase/supabase-js';

// --- Shared Types ---
export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  prep_time: string;
  rating: number;
  distance: string;
  location: string;
  image: string;
  services: {
    preBooking: boolean;
    takeaway: boolean;
    dineIn: boolean;
  };
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price?: number;
  half_price?: number;
  full_price?: number;
  category: string;
  food_type: string;
  has_portions: boolean;
  is_countable: boolean;
  image: string;
}

export interface Order {
  id: string;
  order_type: 'pre-booking' | 'takeaway' | 'dine-in';
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  arrival_time?: string;
  reservation_date?: string;
  table_number?: string;
  created_at: string;
}

// --- Supabase Client ---
export const createSupabaseClient = (url: string, key: string) => {
  return createClient(url, key);
};
