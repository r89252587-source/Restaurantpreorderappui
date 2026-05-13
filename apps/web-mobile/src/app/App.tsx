import { RouterProvider } from "react-router";
import { router } from "@/app/routes";
import { CartProvider } from "@/app/context/CartContext";
import { AuthProvider } from "@/app/context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="max-w-md mx-auto bg-white min-h-screen">
          <RouterProvider router={router} />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
