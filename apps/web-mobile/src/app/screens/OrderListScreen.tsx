import { useNavigate } from "react-router";
import { Clock, MapPin, ChevronRight } from "lucide-react";
import { BottomNav } from "@/app/components/BottomNav";

type OrderType = "pre-booking" | "takeaway" | "dine-in";
type OrderStatus = "confirmed" | "preparing" | "ready" | "completed";

interface Order {
  id: string;
  orderId: string;
  restaurantName: string;
  restaurantLocation: string;
  orderType: OrderType;
  status: OrderStatus;
  totalAmount: number;
  items: number;
  date: string;
  time: string;
}

export function OrderListScreen() {
  const navigate = useNavigate();

  // Mock order data
  const orders: Order[] = [
    {
      id: "1",
      orderId: "12345",
      restaurantName: "Spice Villa",
      restaurantLocation: "Connaught Place, New Delhi",
      orderType: "pre-booking",
      status: "preparing",
      totalAmount: 850,
      items: 4,
      date: "Today",
      time: "7:30 PM",
    },
    {
      id: "2",
      orderId: "12344",
      restaurantName: "Biryani House",
      restaurantLocation: "Karol Bagh, New Delhi",
      orderType: "takeaway",
      status: "ready",
      totalAmount: 450,
      items: 2,
      date: "Today",
      time: "6:45 PM",
    },
    {
      id: "3",
      orderId: "12343",
      restaurantName: "South Flavors",
      restaurantLocation: "Lajpat Nagar, New Delhi",
      orderType: "dine-in",
      status: "completed",
      totalAmount: 620,
      items: 3,
      date: "Yesterday",
      time: "8:00 PM",
    },
  ];

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-700";
      case "preparing":
        return "bg-yellow-100 text-yellow-700";
      case "ready":
        return "bg-green-100 text-green-700";
      case "completed":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case "confirmed":
        return "Confirmed";
      case "preparing":
        return "Preparing";
      case "ready":
        return "Ready";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  const getOrderTypeLabel = (type: OrderType) => {
    switch (type) {
      case "pre-booking":
        return "Pre-Booking";
      case "takeaway":
        return "Takeaway";
      case "dine-in":
        return "Dine-In";
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-[#1A1A1A] mb-1">My Orders</h1>
        <p className="text-[#6B6B6B] text-sm">{orders.length} orders</p>
      </div>

      {/* Orders List */}
      <div className="px-6 py-6 space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">No Orders Yet</h3>
            <p className="text-[#6B6B6B] mb-6">Start ordering from your favorite restaurants</p>
            <button
              onClick={() => navigate("/restaurants")}
              className="px-8 py-3 bg-[#FF0031] text-white rounded-xl font-medium hover:bg-[#E5002C] transition-colors"
            >
              Browse Restaurants
            </button>
          </div>
        ) : (
          orders.map((order) => (
            <button
              key={order.id}
              onClick={() => navigate(`/order-status/${order.orderId}`)}
              className="w-full bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all text-left"
            >
              {/* Order Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[#1A1A1A]">
                      {order.restaurantName}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
                    <MapPin size={14} />
                    <span className="truncate">{order.restaurantLocation}</span>
                  </div>
                </div>
                <ChevronRight size={20} className="text-[#6B6B6B] flex-shrink-0 mt-1" />
              </div>

              {/* Order Details */}
              <div className="flex items-center justify-between py-3 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-[#6B6B6B] mb-1">Order ID</p>
                    <p className="font-semibold text-[#1A1A1A]">#{order.orderId}</p>
                  </div>
                  <div className="w-px h-8 bg-gray-200"></div>
                  <div>
                    <p className="text-xs text-[#6B6B6B] mb-1">Type</p>
                    <p className="font-medium text-[#1A1A1A] text-sm">
                      {getOrderTypeLabel(order.orderType)}
                    </p>
                  </div>
                  <div className="w-px h-8 bg-gray-200"></div>
                  <div>
                    <p className="text-xs text-[#6B6B6B] mb-1">Items</p>
                    <p className="font-medium text-[#1A1A1A] text-sm">{order.items}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#FF0031] text-lg">₹{order.totalAmount}</p>
                </div>
              </div>

              {/* Order Time */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                <Clock size={14} className="text-[#6B6B6B]" />
                <p className="text-sm text-[#6B6B6B]">
                  {order.date} at {order.time}
                </p>
              </div>
            </button>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}
