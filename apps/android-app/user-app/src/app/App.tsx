import { RouterProvider } from "react-router";
import { router } from "@/app/routes";
import { CartProvider } from "@/app/context/CartContext";
import { AuthProvider } from "@/app/context/AuthContext";
import { useEffect } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { supabase } from "@/lib/supabase";
import { Browser } from "@capacitor/browser";
import { StatusBar } from "@capacitor/status-bar";

export default function App() {
  useEffect(() => {
    let isMounted = true;

    // Hide the status bar for a clean UI
    const hideStatusBar = async () => {
      try {
        await StatusBar.hide();
      } catch (e) {
        console.log("Status bar hiding not supported on this platform", e);
      }
    };
    hideStatusBar();

    const handleOAuthCallback = async (rawUrl?: string | null) => {
      if (!rawUrl || !rawUrl.includes("login-callback")) return;

      try {
        await Browser.close();
      } catch {
        // Browser can already be closed; safe to ignore.
      }

      const callbackUrl = new URL(rawUrl);
      const code = callbackUrl.searchParams.get("code");
      const hashParams = new URLSearchParams(callbackUrl.hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const oauthError =
        callbackUrl.searchParams.get("error_description") ||
        hashParams.get("error_description") ||
        callbackUrl.searchParams.get("error") ||
        hashParams.get("error");

      if (oauthError) {
        alert("OAuth Error: " + oauthError);
        console.error("OAuth callback returned an error:", oauthError);
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          alert("Login Failed: " + error.message);
          console.error("Failed to exchange OAuth code:", error.message);
        }
        return;
      }

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          alert("Session Failed: " + error.message);
          console.error("Failed to restore OAuth session from callback:", error.message);
        }
        return;
      }

      alert("Login Error: Received callback but no valid tokens were found.");
      console.error("OAuth callback received but no code or tokens were found:", rawUrl);
    };

    const setupOAuthListeners = async () => {
      const listener = await CapacitorApp.addListener("appUrlOpen", async (event) => {
        if (!isMounted) return;
        await handleOAuthCallback(event.url);
      });

      const launchData = await CapacitorApp.getLaunchUrl();
      if (isMounted) {
        await handleOAuthCallback(launchData?.url);
      }

      return listener;
    };

    let listenerHandle: { remove: () => Promise<void> } | null = null;
    setupOAuthListeners().then((listener) => {
      listenerHandle = listener;
    });

    return () => {
      isMounted = false;
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, []);

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
