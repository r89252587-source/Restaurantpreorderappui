import { createBrowserRouter } from "react-router";
import { SplashScreen } from "@/app/screens/SplashScreen";
import { LoginScreen } from "@/app/screens/LoginScreen";
import { RestaurantListScreen } from "@/app/screens/RestaurantListScreen";
import { MenuScreen } from "@/app/screens/MenuScreen";
import { CartScreen } from "@/app/screens/CartScreen";
import { PreOrderDetailsScreen } from "@/app/screens/PreOrderDetailsScreen";
import { TakeawayDetailsScreen } from "@/app/screens/TakeawayDetailsScreen";
import { DineInDetailsScreen } from "@/app/screens/DineInDetailsScreen";
import { OrderConfirmationScreen } from "@/app/screens/OrderConfirmationScreen";
import { OrderListScreen } from "@/app/screens/OrderListScreen";
import { OrderStatusScreen } from "@/app/screens/OrderStatusScreen";
import { ProfileScreen } from "@/app/screens/ProfileScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: SplashScreen,
  },
  {
    path: "/login",
    Component: LoginScreen,
  },
  {
    path: "/restaurants",
    Component: RestaurantListScreen,
  },
  {
    path: "/menu/:restaurantId",
    Component: MenuScreen,
  },
  {
    path: "/cart",
    Component: CartScreen,
  },
  {
    path: "/pre-order-details",
    Component: PreOrderDetailsScreen,
  },
  {
    path: "/takeaway-details",
    Component: TakeawayDetailsScreen,
  },
  {
    path: "/dine-in-details",
    Component: DineInDetailsScreen,
  },
  {
    path: "/order-confirmation",
    Component: OrderConfirmationScreen,
  },
  {
    path: "/order-status",
    Component: OrderListScreen,
  },
  {
    path: "/order-status/:orderId",
    Component: OrderStatusScreen,
  },
  {
    path: "/profile",
    Component: ProfileScreen,
  },
]);
