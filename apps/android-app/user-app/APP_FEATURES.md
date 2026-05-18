# QuickBite - Restaurant Pre-Order & Dine-In MVP

## Overview
A modern, clean, and user-friendly mobile app UI for restaurant pre-ordering with advance payment functionality.

## 🎯 Goal
Reduce food waiting time by allowing users to view menu, pre-order food, and pay a small advance before reaching the restaurant.

## 🎨 Design System

### Color Palette
- **Primary Color**: #FF0031 (Red) - CTA buttons, highlights, active states
- **Secondary Color**: #FFFFFF (White) - Background, cards
- **Accent Color**: #F5F5F5 (Very light gray) - Section backgrounds
- **Text Primary**: #1A1A1A (Dark charcoal)
- **Text Secondary**: #6B6B6B (Gray)

### Typography
- **Font Family**: Inter
- **Headings**: Semi-Bold / Bold
- **Body Text**: Regular
- **Buttons**: Medium

### UI Components
- Rounded buttons (8-12px radius)
- Soft shadow cards
- Bottom navigation
- Line-based icons from lucide-react

## 📱 Screens Implemented

### 1. Splash Screen (`/`)
- QuickBite logo with red background
- Tagline: "Order before you arrive"
- Auto-redirects to login after 2 seconds
- Animated loading dots

### 2. Login Screen (`/login`)
- Mobile number input with country code
- "Get OTP" primary button
- Clean white background
- Terms & privacy policy footer

### 3. Restaurant List Screen (`/restaurants`)
- Location display header
- Search bar for restaurants/cuisine
- Restaurant cards featuring:
  - High-quality images
  - Restaurant name
  - Cuisine type
  - Star rating
  - Estimated preparation time
- Bottom navigation

### 4. Menu Screen (`/menu/:restaurantId`)
- Restaurant header with image overlay
- Category tabs: All, Veg, Non-Veg
- Food item cards with:
  - Veg/Non-veg indicator
  - Item name & description
  - Price
  - Add/quantity buttons
  - Food image
- Floating cart button showing total items & price

### 5. Cart Screen (`/cart`)
- List of selected items
- Quantity controls (+/- buttons)
- Delete item option
- Advance payment information box
- Bill summary:
  - Subtotal
  - Advance payment (₹50)
  - Pay at restaurant amount
- "Confirm Pre-Order" CTA button

### 6. Order Confirmation Screen (`/order-confirmation`)
- Success animation with checkmark
- Large order ID display
- Payment breakdown
- Order status indicator
- Instructions to show ID at restaurant
- "Track Order" and "Back to Home" buttons

### 7. Order Status Screen (`/order-status/:orderId`)
- Prominent order ID card
- Order progress timeline:
  - Order Confirmed
  - Being Prepared
  - Ready for Pickup
- Estimated time display
- Add extra items section (collapsible):
  - Drinks
  - Rotis
  - Rice
  - Raita
- Restaurant contact details
- Demo status controls
- Bottom navigation

## ✨ Key Features

### Cart Management
- Add/remove items
- Adjust quantities
- Real-time total calculation
- Persistent cart state using React Context

### Pre-Order Flow
1. Browse restaurants
2. Select items from menu
3. Review cart
4. Pay advance (₹50)
5. Get order ID
6. Track order status
7. Show ID at restaurant

### User Experience
- Smooth transitions
- Hover effects
- Loading states
- Empty states
- Mobile-optimized layout
- Intuitive navigation
- Clear visual hierarchy

### Search & Filter
- Restaurant search by name/cuisine
- Menu category filters (All/Veg/Non-Veg)
- Real-time filtering

## 🛠️ Technical Stack

- **Framework**: React with TypeScript
- **Routing**: React Router v7 (Data mode)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **State Management**: React Context API
- **Font**: Google Fonts (Inter)

## 📐 Design Principles

1. **Mobile-First**: Optimized for mobile devices (max-width: 448px)
2. **Minimal**: Clean interface with no clutter
3. **Fast**: Quick decision-making support
4. **Trustworthy**: Clear pricing and payment information
5. **Accessible**: Good color contrast and readable text
6. **Indian Food App Feel**: Red color scheme, familiar patterns

## 🎯 User Flow

```
Splash → Login → Restaurant List → Menu → Cart → Order Confirmation → Order Status
                      ↑                                                      ↓
                      └──────────────────────────────────────────────────────┘
```

## 📦 Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── BottomNav.tsx
│   │   └── AppInfo.tsx
│   ├── context/
│   │   └── CartContext.tsx
│   ├── data/
│   │   └── mockData.ts
│   ├── screens/
│   │   ├── SplashScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── RestaurantListScreen.tsx
│   │   ├── MenuScreen.tsx
│   │   ├── CartScreen.tsx
│   │   ├── OrderConfirmationScreen.tsx
│   │   └── OrderStatusScreen.tsx
│   ├── routes.ts
│   └── App.tsx
└── styles/
    ├── fonts.css
    └── theme.css
```

## 🚀 Next Steps (Future Enhancements)

- Real backend integration with Supabase
- User authentication with OTP
- Payment gateway integration
- Real-time order updates
- Push notifications
- Order history
- User profile management
- Favorites/saved restaurants
- Offers and promotions
- Reviews and ratings

---

**Version**: 1.0.0-MVP  
**Status**: Ready for handoff  
**Platform**: Android first (mobile-optimized)
