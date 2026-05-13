import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Search, MapPin, Star, Clock, CalendarClock, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { BottomNav } from "@/app/components/BottomNav";
import { supabase } from "@/lib/supabase";

type OrderType = "pre-booking" | "takeaway" | "dine-in";

export function RestaurantListScreen() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderType, setSelectedOrderType] = useState<OrderType>("pre-booking");
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const { data, error } = await supabase.from('restaurants').select('*');
        if (error) throw error;
        setRestaurants(data || []);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  const filteredRestaurants = restaurants.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const orderOptions = [
    {
      type: "pre-booking" as OrderType,
      label: "Pre-Booking",
      icon: CalendarClock,
      description: "Order in advance"
    },
    {
      type: "takeaway" as OrderType,
      label: "Take Away",
      icon: ShoppingBag,
      description: "Quick pickup"
    },
    {
      type: "dine-in" as OrderType,
      label: "Dine-In",
      icon: UtensilsCrossed,
      description: "Reserve a table"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={20} className="text-[#FF0031]" />
          <div>
            <h1 className="text-xl font-semibold text-[#1A1A1A]">Deliver to</h1>
            <p className="text-sm text-[#6B6B6B]">Indiranagar, Bangalore</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for restaurants or cuisine"
            className="w-full pl-12 pr-4 py-3 bg-[#F5F5F5] rounded-xl border-none outline-none focus:ring-2 focus:ring-[#FF0031] text-[#1A1A1A] placeholder:text-[#6B6B6B]"
          />
        </div>
      </div>

      {/* Order Type Options */}
      <div className="px-6 py-4 bg-white">
        <div className="grid grid-cols-3 gap-3">
          {orderOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedOrderType === option.type;
            return (
              <button
                key={option.type}
                onClick={() => setSelectedOrderType(option.type)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                  isSelected
                    ? "bg-[#FF0031] text-white shadow-lg shadow-[#FF0031]/20"
                    : "bg-[#F5F5F5] text-[#1A1A1A] hover:bg-gray-200"
                }`}
              >
                <Icon size={24} strokeWidth={2} />
                <div className="text-center">
                  <div className="font-semibold text-sm">{option.label}</div>
                  <div className={`text-xs mt-0.5 ${isSelected ? "text-white/80" : "text-[#6B6B6B]"}`}>
                    {option.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Restaurant List */}
      <div className="px-6 py-6 space-y-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">Nearby Restaurants</h2>
          <span className="text-xs px-3 py-1 bg-[#FF0031] text-white rounded-full font-medium capitalize">
            {selectedOrderType.replace("-", " ")}
          </span>
        </div>
        <p className="text-sm text-[#6B6B6B] mb-4">{filteredRestaurants.length} restaurants available</p>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-[#6B6B6B]">Loading restaurants...</p>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#6B6B6B]">No restaurants found</p>
            <p className="text-sm text-[#6B6B6B] mt-2">Try a different search term</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRestaurants.map((restaurant) => (
              <button
                key={restaurant.id}
                onClick={() => navigate(`/menu/${restaurant.id}`)}
                className="w-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-[#1A1A1A]">
                      {restaurant.name}
                    </h3>
                    <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded-lg text-sm">
                      <Star size={14} fill="white" />
                      <span>{restaurant.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-[#6B6B6B] text-sm mb-3">{restaurant.cuisine}</p>
                  
                  <div className="flex items-center gap-1 text-[#6B6B6B] text-sm">
                    <Clock size={16} />
                    <span>{restaurant.prepTime}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}