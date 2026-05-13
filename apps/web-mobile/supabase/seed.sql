-- Insert Restaurants
INSERT INTO restaurants (id, name, cuisine, prep_time, rating, distance, location, image, services) VALUES
('11111111-1111-1111-1111-111111111111', 'Spice Villa', 'North Indian, Chinese', '20-25 min', 4.5, '1.2 km', 'Connaught Place, New Delhi', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80', '{"preBooking": true, "takeaway": true, "dineIn": true}'),
('22222222-2222-2222-2222-222222222222', 'Biryani House', 'Mughlai, Biryani', '25-30 min', 4.7, '2.5 km', 'Karol Bagh, New Delhi', 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&q=80', '{"preBooking": true, "takeaway": true, "dineIn": false}'),
('33333333-3333-3333-3333-333333333333', 'South Flavors', 'South Indian', '15-20 min', 4.3, '0.8 km', 'Lajpat Nagar, New Delhi', 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&q=80', '{"preBooking": true, "takeaway": false, "dineIn": true}');

-- Insert Menu Items for Spice Villa (Restaurant 1)
INSERT INTO menu_items (id, restaurant_id, name, description, price, category, food_type, image) VALUES
('10000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Paneer Tikka', 'Grilled cottage cheese with spices', 250, 'veg', 'starter', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&q=80'),
('10000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Chicken Wings', 'Crispy wings with tangy sauce', 280, 'non-veg', 'starter', 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=300&q=80');

INSERT INTO menu_items (id, restaurant_id, name, description, half_price, full_price, category, food_type, has_portions, image) VALUES
('10000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Paneer Butter Masala', 'Rich and creamy curry with cottage cheese', 180, 320, 'veg', 'main', true, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&q=80');
