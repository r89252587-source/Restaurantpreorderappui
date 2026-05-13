import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, CheckCircle2, Clock, ChefHat, PackageCheck, Plus } from "lucide-react";
import { BottomNav } from "@/app/components/BottomNav";

type OrderStatus = "confirmed" | "preparing" | "ready";

export function OrderStatusScreen() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("preparing");
  const [showAddItems, setShowAddItems] = useState(false);

  const statusSteps = [
    {
      id: "confirmed",
      label: "Order Confirmed",
      icon: CheckCircle2,
      completed: true,
    },
    {
      id: "preparing",
      label: "Being Prepared",
      icon: ChefHat,
      completed: orderStatus === "preparing" || orderStatus === "ready",
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
        <p className="text-[#6B6B6B] text-sm">Order ID: #{orderId}</p>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Order ID Card */}
        <div className="bg-gradient-to-br from-[#FF0031] to-[#E5002C] rounded-2xl p-6 text-white shadow-lg">
          <p className="text-white/80 text-sm mb-2">Your Order ID</p>
          <h2 className="text-4xl font-bold tracking-wider mb-4">#{orderId}</h2>
          <p className="text-white/90 text-sm">
            Show this ID to the restaurant staff when you arrive
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

          {/* Demo Status Controls */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-[#6B6B6B] mb-3">Demo: Change status</p>
            <div className="flex gap-2">
              <button
                onClick={() => setOrderStatus("confirmed")}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  orderStatus === "confirmed"
                    ? "bg-[#FF0031] text-white"
                    : "bg-gray-200 text-[#6B6B6B]"
                }`}
              >
                Confirmed
              </button>
              <button
                onClick={() => setOrderStatus("preparing")}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  orderStatus === "preparing"
                    ? "bg-[#FF0031] text-white"
                    : "bg-gray-200 text-[#6B6B6B]"
                }`}
              >
                Preparing
              </button>
              <button
                onClick={() => setOrderStatus("ready")}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  orderStatus === "ready"
                    ? "bg-[#FF0031] text-white"
                    : "bg-gray-200 text-[#6B6B6B]"
                }`}
              >
                Ready
              </button>
            </div>
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
