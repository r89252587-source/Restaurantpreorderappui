import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, CheckCircle2, Clock, ChefHat, PackageCheck, Plus, Loader2 } from "lucide-react";
import { BottomNav } from "@/app/components/BottomNav";
import { supabase } from "@/lib/supabase";

type OrderStatus = "confirmed" | "preparing" | "ready";

export function OrderStatusScreen() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddItems, setShowAddItems] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (error) throw error;
        setOrder(data);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Subscribe to real-time status changes
    const channel = supabase
      .channel(`order-${orderId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'orders',
        filter: `id=eq.${orderId}`
      }, payload => {
        setOrder(payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const orderStatus = order?.status || "pending";

  const statusSteps = [
    {
      id: "pending",
      label: "Order Confirmed",
      icon: CheckCircle2,
      completed: true, // Always true if order exists
    },
    {
      id: "preparing",
      label: "Being Prepared",
      icon: ChefHat,
      completed: orderStatus === "confirmed" || orderStatus === "preparing" || orderStatus === "ready",
    },
    {
      id: "ready",
      label: "Ready for Pickup",
      icon: PackageCheck,
      completed: orderStatus === "ready",
    },
  ];

  const extraItems = [
    { id: "e1", name: "Butter Roti", price: 15 },
    { id: "e2", name: "Plain Rice", price: 80 },
    { id: "e3", name: "Raita", price: 50 },
    { id: "e4", name: "Coke (330ml)", price: 40 },
    { id: "e5", name: "Mineral Water", price: 20 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <Loader2 size={48} className="text-[#FF0031] animate-spin mb-4" />
        <h2 className="text-xl font-semibold">Loading Order...</h2>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <ArrowLeft size={32} className="text-[#FF0031]" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
        <p className="text-[#6B6B6B] mb-8">We couldn't find the order with ID #{orderId.slice(0, 8)}</p>
        <button 
          onClick={() => navigate("/restaurants")}
          className="w-full py-4 bg-[#FF0031] text-white rounded-xl font-medium"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 shadow-sm">
        <button
          onClick={() => navigate("/order-status")}
          className="mb-4 p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-[#1A1A1A]" />
        </button>

        <h1 className="text-2xl font-semibold text-[#1A1A1A] mb-1">Order Details</h1>
        <p className="text-[#6B6B6B] text-sm font-mono">OTP: #{order?.otp || '------'}</p>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Order OTP Card */}
        <div className="bg-gradient-to-br from-[#FF0031] to-[#E5002C] rounded-2xl p-6 text-white shadow-lg">
          <p className="text-white/80 text-sm mb-2 font-medium uppercase tracking-wider">Verification OTP</p>
          <h2 className="text-5xl font-bold tracking-[0.2em] mb-4">{order?.otp || '------'}</h2>
          <p className="text-white/90 text-sm italic">
            Show this OTP to the restaurant staff when you arrive
          </p>
        </div>

        {/* Progress Timeline */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-[#1A1A1A] mb-6">Order Progress</h3>
          
          <div className="space-y-6">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === statusSteps.length - 1;
              
              return (
                <div key={step.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        step.completed
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      <Icon size={24} />
                    </div>
                    {!isLast && (
                      <div
                        className={`w-1 h-12 mt-2 ${
                          step.completed ? "bg-green-500" : "bg-gray-200"
                        }`}
                      ></div>
                    )}
                  </div>
                  
                  <div className="flex-1 pt-2">
                    <h4
                      className={`font-semibold mb-1 ${
                        step.completed ? "text-[#1A1A1A]" : "text-[#6B6B6B]"
                      }`}
                    >
                      {step.label}
                    </h4>
                    <p className="text-sm text-[#6B6B6B]">
                      {step.completed ? (
                        step.id === "ready" && orderStatus === "ready" ? (
                          <span className="text-green-600 font-medium">
                            Your order is ready! 🎉
                          </span>
                        ) : (
                          <span className="text-green-600">Completed</span>
                        )
                      ) : (
                        <span>Pending</span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Progress Info */}
          <div className="mt-4 text-center">
            {orderStatus === "ready" ? (
              <p className="text-green-600 font-bold animate-bounce">
                Pick up your order now!
              </p>
            ) : orderStatus === "cancelled" ? (
              <p className="text-red-600 font-bold">
                This order was cancelled.
              </p>
            ) : (
              <p className="text-[#6B6B6B] text-sm">
                Last updated: {new Date(order?.created_at).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        {/* Estimated Time */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
          <Clock size={24} className="text-blue-600" />
          <div>
            <h4 className="font-semibold text-[#1A1A1A]">Estimated Time</h4>
            <p className="text-sm text-[#6B6B6B]">Your order will be ready in 15-20 minutes</p>
          </div>
        </div>

        {/* Add Extra Items */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <button
            onClick={() => setShowAddItems(!showAddItems)}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FF0031] rounded-full flex items-center justify-center">
                <Plus size={20} className="text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-[#1A1A1A]">Add Extra Items</h3>
                <p className="text-sm text-[#6B6B6B]">Drinks, rotis, and more</p>
              </div>
            </div>
            <div
              className={`transition-transform ${
                showAddItems ? "rotate-45" : "rotate-0"
              }`}
            >
              <Plus size={20} className="text-[#6B6B6B]" />
            </div>
          </button>

          {showAddItems && (
            <div className="px-6 pb-6 space-y-3 border-t border-gray-200 pt-4">
              {extraItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-[#F5F5F5] rounded-xl"
                >
                  <div>
                    <h4 className="font-medium text-[#1A1A1A]">{item.name}</h4>
                    <p className="text-sm text-[#6B6B6B]">₹{item.price}</p>
                  </div>
                  <button className="px-6 py-2 bg-[#FF0031] text-white rounded-lg text-sm font-medium hover:bg-[#E5002C] transition-colors">
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Restaurant Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-[#1A1A1A] mb-4">Restaurant Details</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-[#6B6B6B] mb-1">Name</p>
              <p className="font-medium text-[#1A1A1A]">Spice Villa</p>
            </div>
            <div>
              <p className="text-sm text-[#6B6B6B] mb-1">Address</p>
              <p className="font-medium text-[#1A1A1A]">
                123, MG Road, Indiranagar, Bangalore - 560038
              </p>
            </div>
            <div>
              <p className="text-sm text-[#6B6B6B] mb-1">Phone</p>
              <p className="font-medium text-[#1A1A1A]">+91 98765 43210</p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
