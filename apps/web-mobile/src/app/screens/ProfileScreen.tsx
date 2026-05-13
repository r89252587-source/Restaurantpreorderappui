import { useNavigate } from "react-router";
import {
  User,
  MapPin,
  CreditCard,
  Bell,
  HelpCircle,
  FileText,
  Shield,
  LogOut,
  ChevronRight,
  Edit,
  Mail,
  Phone
} from "lucide-react";
import { BottomNav } from "@/app/components/BottomNav";
import { useAuth } from "@/app/context/AuthContext";

export function ProfileScreen() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#FF0031] to-[#E5002C] px-6 pt-12 pb-8 text-white">
        <h1 className="text-2xl font-semibold mb-6">My Profile</h1>

        {/* User Info Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <User size={32} className="text-[#FF0031]" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User"}
              </h2>
              <p className="text-white/80 text-sm">QuickBite Member</p>
            </div>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Edit size={20} className="text-white" />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3 text-white/90">
              <Mail size={16} />
              <span className="text-sm">{user?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <Phone size={16} />
              <span className="text-sm">{user?.phone || "Not provided"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Options */}
      <div className="px-6 py-6 space-y-4">
        {/* Account Section */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-[#1A1A1A]">Account</h3>
          </div>

          <button
            onClick={() => {}}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#F5F5F5] rounded-full flex items-center justify-center">
                <MapPin size={20} className="text-[#FF0031]" />
              </div>
              <div className="text-left">
                <p className="font-medium text-[#1A1A1A]">Saved Addresses</p>
                <p className="text-sm text-[#6B6B6B]">Manage your delivery addresses</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-[#6B6B6B]" />
          </button>

          <button
            onClick={() => {}}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#F5F5F5] rounded-full flex items-center justify-center">
                <CreditCard size={20} className="text-[#FF0031]" />
              </div>
              <div className="text-left">
                <p className="font-medium text-[#1A1A1A]">Payment Methods</p>
                <p className="text-sm text-[#6B6B6B]">Manage cards and UPI</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-[#6B6B6B]" />
          </button>
        </div>

        {/* Preferences Section */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-[#1A1A1A]">Preferences</h3>
          </div>

          <button
            onClick={() => {}}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#F5F5F5] rounded-full flex items-center justify-center">
                <Bell size={20} className="text-[#FF0031]" />
              </div>
              <div className="text-left">
                <p className="font-medium text-[#1A1A1A]">Notifications</p>
                <p className="text-sm text-[#6B6B6B]">Order updates & offers</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-[#6B6B6B]" />
          </button>
        </div>

        {/* Support Section */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-[#1A1A1A]">Support & Legal</h3>
          </div>

          <button
            onClick={() => {}}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#F5F5F5] rounded-full flex items-center justify-center">
                <HelpCircle size={20} className="text-[#FF0031]" />
              </div>
              <div className="text-left">
                <p className="font-medium text-[#1A1A1A]">Help & Support</p>
                <p className="text-sm text-[#6B6B6B]">FAQs and contact us</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-[#6B6B6B]" />
          </button>

          <button
            onClick={() => {}}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#F5F5F5] rounded-full flex items-center justify-center">
                <FileText size={20} className="text-[#FF0031]" />
              </div>
              <div className="text-left">
                <p className="font-medium text-[#1A1A1A]">Terms & Conditions</p>
                <p className="text-sm text-[#6B6B6B]">Read our terms</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-[#6B6B6B]" />
          </button>

          <button
            onClick={() => {}}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#F5F5F5] rounded-full flex items-center justify-center">
                <Shield size={20} className="text-[#FF0031]" />
              </div>
              <div className="text-left">
                <p className="font-medium text-[#1A1A1A]">Privacy Policy</p>
                <p className="text-sm text-[#6B6B6B]">Your data protection</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-[#6B6B6B]" />
          </button>
        </div>

        {/* App Info */}
        <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
          <p className="text-sm text-[#6B6B6B] mb-1">QuickBite Version</p>
          <p className="font-semibold text-[#1A1A1A]">1.0.0</p>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-white rounded-2xl p-5 shadow-sm flex items-center justify-center gap-3 hover:bg-red-50 transition-colors group"
        >
          <LogOut size={20} className="text-[#FF0031]" />
          <span className="font-semibold text-[#FF0031]">Logout</span>
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
