import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, BookOpen, Store, BarChart2,
  Users, LogOut, Utensils, Bell, Package, Clock,
  RefreshCw, Check, X, Plus, Edit2, Trash2, Save, IndianRupee, Menu
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function isRestaurantProfileComplete(restaurant: any) {
  if (!restaurant) return false;
  return Boolean(
    String(restaurant.name || '').trim() &&
    String(restaurant.cuisine || '').trim() &&
    String(restaurant.location || '').trim() &&
    String(restaurant.phone || '').trim() &&
    String(restaurant.opening_hours || '').trim() &&
    String(restaurant.prep_time || '').trim()
  );
}

export default function Dashboard({ session: _session, profile, onSignOut }: { session: any, profile: any, onSignOut: () => Promise<any> | void }) {
  const userId = _session?.user?.id || null;
  const [orders, setOrders] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [restaurantLoading, setRestaurantLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  // default to dashboard if root
  const currentPath = location.pathname.split('/')[1] || 'dashboard';

  useEffect(() => {
    fetchRestaurantData();
  }, []);

  useEffect(() => {
    if (restaurant?.id) {
      fetchOrders(restaurant.id);
      fetchMenu(restaurant.id);
    }
  }, [restaurant?.id]);

  useEffect(() => {
    if (!restaurantLoading && !isRestaurantProfileComplete(restaurant) && currentPath !== 'restaurants') {
      navigate('/restaurants', { replace: true });
    }
  }, [restaurantLoading, restaurant, currentPath, navigate]);

  async function fetchOrders(restId?: string) {
    const targetId = restId || restaurant?.id;
    if (!targetId) return;
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', targetId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
    }
  }

  async function fetchMenu(restId?: string) {
    const targetId = restId || restaurant?.id;
    if (!targetId) return;
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', targetId)
        .order('name');

      if (error) throw error;
      setMenuItems(data || []);
    } catch (err: any) {
      console.error('Error fetching menu:', err);
    }
  }

  async function fetchRestaurantData() {
    try {
      let data: any = null;
      let error: any = null;

      if (userId) {
        const byOwner = await supabase
          .from('restaurants')
          .select('*')
          .eq('owner_id', userId)
          .limit(1)
          .maybeSingle();
        data = byOwner.data;
        error = byOwner.error;
      } else {
        const fallback = await supabase
          .from('restaurants')
          .select('*')
          .limit(1)
          .maybeSingle();
        data = fallback.data;
        error = fallback.error;
      }

      if (error) throw error;
      const nextRestaurant = data || null;
      setRestaurant(nextRestaurant);
      return nextRestaurant;
    } catch (err: any) {
      console.error('Error fetching restaurant:', err);
      return null;
    } finally {
      setRestaurantLoading(false);
    }
  }

  return (
    <div className="android-app-layout">
      <Header
        viewTitle={currentPath}
        userProfile={profile}
        onSignOut={onSignOut}
      />

      <main className="android-main-content">
        <Routes>
          <Route path="/" element={<DashboardView orders={orders} fetchOrders={fetchOrders} />} />
          <Route path="/orders" element={<OrdersView orders={orders} fetchOrders={fetchOrders} />} />
          <Route path="/menu" element={<MenuManagementView menuItems={menuItems} fetchMenu={fetchMenu} restaurantId={restaurant?.id} />} />
          <Route path="/restaurants" element={<SettingsView restaurant={restaurant} fetchRestaurant={fetchRestaurantData} onProfileCompleted={() => navigate('/', { replace: true })} />} />
          <Route path="/analytics" element={<AnalyticsView orders={orders} />} />
        </Routes>
      </main>

      <BottomNav
        currentView={currentPath}
        setView={(v) => { navigate(v === 'dashboard' ? '/' : `/${v}`); }}
      />
    </div>
  );
}


function BottomNav({ currentView, setView }: { currentView: string, setView: (v: string) => void }) {
  const links: { id: string, icon: any, label: string }[] = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dash' },
    { id: 'orders', icon: ShoppingBag, label: 'Orders' },
    { id: 'menu', icon: BookOpen, label: 'Menu' },
    { id: 'restaurants', icon: Store, label: 'Settings' },
    { id: 'analytics', icon: BarChart2, label: 'Reports' },
  ];

  return (
    <nav className="bottom-nav">
      {links.map(link => (
        <button
          key={link.id}
          onClick={() => setView(link.id)}
          className={`bottom-nav-item ${currentView === link.id ? 'active' : ''}`}
        >
          <div className="bottom-nav-icon">
            <link.icon size={22} />
          </div>
          <span className="bottom-nav-label">{link.label}</span>
        </button>
      ))}
    </nav>
  );
}

function Header({ viewTitle, userProfile, onSignOut }: { viewTitle: string, userProfile: any, onSignOut: () => void }) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const titles: Record<string, string> = {
    dashboard: 'Dashboard',
    orders: 'Orders',
    menu: 'Menu',
    restaurants: 'Settings',
    analytics: 'Analytics'
  };

  return (
    <header className="android-app-bar shadow-sm">
      <div className="header-left">
        <h1 className="android-app-title">{titles[viewTitle] || 'Dashboard'}</h1>
      </div>
      <div className="user-profile relative">
        <button className="android-icon-btn">
          <Bell size={22} />
        </button>
        <div style={{ position: 'relative' }}>
          <button
            className="avatar-btn"
            onClick={() => setProfileMenuOpen(prev => !prev)}
          >
            {userProfile?.avatar_url ? <img src={userProfile.avatar_url} className="avatar-img" /> : <div className="avatar-placeholder">AD</div>}
          </button>
          {profileMenuOpen && (
            <div className="android-dropdown-menu">
              <button
                onClick={() => {
                  setProfileMenuOpen(false);
                  onSignOut();
                }}
                className="android-dropdown-item text-danger"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Data Views
function DashboardView({ orders, fetchOrders }: { orders: any[], fetchOrders: () => void }) {
  const [otpSearch, setOtpSearch] = useState('');
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  const confirmedOrders = orders.filter(o => o.status === 'confirmed');
  const filteredConfirmedOrders = otpSearch.trim()
    ? confirmedOrders.filter(o => o.otp && o.otp.includes(otpSearch.trim()))
    : confirmedOrders;

  return (
    <div className="dashboard-view-container animate-fade-in">
      <div className="stats-grid">
        <StatCard
          icon={Package}
          gradient="linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)"
          title="Total Orders"
          value={orders.length}
        />
        <StatCard
          icon={IndianRupee}
          gradient="linear-gradient(135deg, #10B981 0%, #059669 100%)"
          title="Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
        />
        <StatCard
          icon={Clock}
          gradient="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
          title="Pending"
          value={pendingCount}
        />
      </div>

      <div className="content-card" style={{ marginBottom: '0.75rem', border: '1px solid #10B981' }}>
        <div className="card-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#059669' }}>Confirmed</h2>
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>OTP verification pending</p>
            </div>
            <button className="btn" style={{ background: '#10B981', color: 'white', padding: '0.375rem 0.75rem', fontSize: '0.75rem' }} onClick={fetchOrders}>
              <RefreshCw size={14} />
            </button>
          </div>
          <input
            type="text"
            placeholder="Search OTP..."
            value={otpSearch}
            onChange={(e) => setOtpSearch(e.target.value.replace(/\D/g, '').slice(0, 6))}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid #10B981',
              outline: 'none',
              width: '100%',
              fontSize: '0.8125rem',
              letterSpacing: otpSearch ? '0.15em' : 'normal',
              fontFamily: otpSearch ? 'monospace' : 'inherit'
            }}
          />
        </div>
        <OrdersTable orders={filteredConfirmedOrders} onUpdate={fetchOrders} />
      </div>

      <div className="content-card">
        <div className="card-header" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Recent Orders</h2>
            <p className="text-muted" style={{ fontSize: '0.75rem' }}>Latest activity</p>
          </div>
          <button className="btn" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', background: 'var(--primary)', color: 'white' }} onClick={fetchOrders}>
            <RefreshCw size={14} />
          </button>
        </div>
        <OrdersTable orders={orders.slice(0, 5)} onUpdate={fetchOrders} />
      </div>
    </div>
  );
}

function OrdersView({ orders, fetchOrders }: { orders: any[], fetchOrders: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = !searchQuery.trim() ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      (order.otp && order.otp.includes(searchQuery.trim()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="animate-fade-in">
      <div className="content-card premium-card">
        <div className="card-header modern" style={{ paddingBottom: '1.5rem' }}>
          <div>
            <h2 className="text-lg font-bold">All Orders</h2>
            <p className="text-muted text-sm">Full order history and status</p>
          </div>
          <button className="btn btn-primary premium-hover" onClick={fetchOrders}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        <div className="filters-bar" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0 1rem 1rem 1rem' }}>
          <div className="search-wrapper" style={{ width: '100%', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search ID/OTP..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.4rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.8rem' }}
            />
          </div>
          <div className="category-filters" style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.2rem', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style>{`.category-filters::-webkit-scrollbar { display: none; }`}</style>
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  textTransform: 'capitalize',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '1rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  background: statusFilter === status ? 'var(--primary)' : 'white',
                  border: '1px solid #E2E8F0',
                  color: statusFilter === status ? 'white' : 'var(--text-muted)'
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <OrdersTable orders={filteredOrders} onUpdate={fetchOrders} />
      </div>
    </div>
  );
}

function OrdersTable({ orders, onUpdate }: { orders: any[], onUpdate: () => void }) {
  const [verifyingOrder, setVerifyingOrder] = useState<any>(null);
  const [viewingOrder, setViewingOrder] = useState<any>(null);

  const getCustomerName = (order: any) =>
    order.customer_name || order.customer_full_name || order.full_name || order.name || 'Guest User';
  const getCustomerPhone = (order: any) =>
    order.customer_phone || order.phone || order.mobile || order.contact_phone || 'Not provided';
  const getExpectedTime = (order: any) => order.arrival_time || order.booking_time || null;
  const getPeopleCount = (order: any) => order.number_of_people ?? order.people_count ?? order.guests ?? null;

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (!error) onUpdate();
  }

  return (
    <div>
      <div className="table-responsive order-table-desktop">
        <table className="modern-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date & Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                No orders found
              </td>
            </tr>
          ) : orders.map((order, idx) => (
            <tr
              key={order.id}
              style={{ animationDelay: `${idx * 0.05}s`, cursor: 'pointer' }}
              className="table-row-animate hover-row"
              onClick={() => setViewingOrder(order)}
            >
              <td className="font-medium text-main">#{order.id.slice(0, 8).toUpperCase()}</td>
              <td>
                <div className="customer-cell">
                  <div className="customer-avatar">G</div>
                  <div className="customer-info">
                    <span className="customer-name">Guest User</span>
                    <span className="customer-id">ID: {order.id.slice(0, 4)}</span>
                  </div>
                </div>
              </td>
              <td>
                <span className="type-badge">
                  {order.order_type === 'pre-booking' ? 'Pre Booking' : order.order_type}
                </span>
              </td>
              <td className="font-bold">₹{order.total_amount}</td>
              <td><span className={`modern-badge status-${order.status || 'pending'}`}>{order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}</span></td>
              <td className="text-muted">
                <div style={{ fontWeight: 500 }}>{new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                <div style={{ fontSize: '0.8rem', marginTop: '0.2rem', color: '#94A3B8' }}>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </td>
              <td>
                <div className="action-buttons" onClick={e => e.stopPropagation()}>
                  {(!order.status || order.status === 'pending') && (
                    <>
                      <button className="action-btn success tooltip" data-tip="Confirm" onClick={() => updateStatus(order.id, 'confirmed')}><Check size={16} /></button>
                      <button className="action-btn danger tooltip" data-tip="Cancel" onClick={() => updateStatus(order.id, 'cancelled')}><X size={16} /></button>
                    </>
                  )}
                  {order.status === 'confirmed' && (
                    <button className="btn btn-primary premium-hover" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '0.5rem' }} onClick={() => setVerifyingOrder(order)}>
                      Verify & Complete
                    </button>
                  )}
                  {order.status === 'completed' && order.otp_verified_at && (
                    <span className="text-muted" style={{ fontSize: '0.75rem', display: 'block', marginTop: '0.2rem' }}>
                      Verified: {new Date(order.otp_verified_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>

      <div className="order-cards-mobile">
        {orders.length === 0 ? (
          <div className="content-card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            No orders found
          </div>
        ) : orders.map((order, idx) => {
          const orderType = String(order.order_type || '').toLowerCase();
          const isDineIn = orderType === 'dine-in';
          const expectedTime = getExpectedTime(order);
          const people = getPeopleCount(order);

          return (
            <div 
              key={order.id} 
              className="content-card premium-card table-row-animate" 
              style={{ animationDelay: `${idx * 0.05}s`, marginBottom: '0.9rem', padding: '1rem', cursor: 'pointer' }}
              onClick={() => setViewingOrder(order)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <p className="font-medium text-main">#{order.id.slice(0, 8).toUpperCase()}</p>
                <span className={`modern-badge status-${order.status || 'pending'}`}>{order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}</span>
              </div>
              <div style={{ display: 'grid', gap: '0.35rem', fontSize: '0.85rem' }}>
                <div><strong>Customer:</strong> {getCustomerName(order)}</div>
                <div><strong>Phone:</strong> {getCustomerPhone(order)}</div>
                <div><strong>Type:</strong> {order.order_type === 'pre-booking' ? 'Pre Booking' : order.order_type}</div>
                <div><strong>Amount:</strong> ₹{order.total_amount}</div>
                {expectedTime && <div><strong>Expected Time:</strong> {expectedTime}</div>}
                {isDineIn && <div><strong>Persons:</strong> {people || 'Not provided'}</div>}
                <div><strong>Date:</strong> {new Date(order.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</div>
              </div>
              <div className="action-buttons" style={{ marginTop: '0.8rem' }} onClick={(e) => e.stopPropagation()}>
                {(!order.status || order.status === 'pending') && (
                  <>
                    <button className="action-btn success tooltip" data-tip="Confirm" onClick={() => updateStatus(order.id, 'confirmed')}><Check size={16} /></button>
                    <button className="action-btn danger tooltip" data-tip="Cancel" onClick={() => updateStatus(order.id, 'cancelled')}><X size={16} /></button>
                  </>
                )}
                {order.status === 'confirmed' && (
                  <button className="btn btn-primary premium-hover" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '0.5rem' }} onClick={() => setVerifyingOrder(order)}>
                    Verify & Complete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {verifyingOrder && (
        <OtpVerifyModal
          order={verifyingOrder}
          onClose={() => setVerifyingOrder(null)}
          onSuccess={() => { setVerifyingOrder(null); onUpdate(); }}
        />
      )}

      {viewingOrder && (
        <OrderDetailsModal
          order={viewingOrder}
          onClose={() => setViewingOrder(null)}
        />
      )}
    </div>
  );
}

function OrderDetailsModal({ order, onClose }: { order: any, onClose: () => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [customerProfile, setCustomerProfile] = useState<any>(null);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const orderType = String(order.order_type || '').toLowerCase();
  const isDineIn = orderType === 'dine-in';
  const isPreBookingOrTakeaway = orderType === 'pre-booking' || orderType === 'takeaway';
  const peopleCount = order.number_of_people ?? order.people_count ?? order.guests ?? null;
  const expectedTime = order.arrival_time || order.booking_time || null;
  const reservationDate = order.reservation_date || order.booking_date || null;
  const customerName =
    order.customer_name ||
    order.customer_full_name ||
    order.full_name ||
    order.name ||
    customerProfile?.full_name ||
    'Guest User';
  const customerPhone =
    order.customer_phone ||
    order.phone ||
    order.mobile ||
    order.contact_phone ||
    customerProfile?.phone ||
    'Not provided';

  useEffect(() => {
    async function fetchCustomerProfile() {
      const uid = order.user_uid || order.user_id;
      if (!uid) return;
      setCustomerLoading(true);
      try {
        const { data: userProfileData } = await supabase
          .from('userProfile')
          .select('full_name, phone')
          .eq('id', uid)
          .maybeSingle();
        if (userProfileData && (userProfileData.full_name || userProfileData.phone)) {
          setCustomerProfile(userProfileData);
          return;
        }

        const { data: profilesData } = await supabase
          .from('profiles')
          .select('full_name, phone')
          .eq('id', uid)
          .maybeSingle();
        if (profilesData) {
          setCustomerProfile(profilesData);
        }
      } catch (err) {
        console.error('Error fetching customer profile:', err);
      } finally {
        setCustomerLoading(false);
      }
    }

    async function fetchItems() {
      try {
        const { data, error } = await supabase
          .from('order_items')
          .select(`
            id, quantity, portion,
            menu_items (name, image, price, half_price, full_price)
          `)
          .eq('order_id', order.id);

        if (!error && data) {
          setItems(data);
        }
      } catch (err) {
        console.error('Error fetching order items:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomerProfile();
    fetchItems();
  }, [order.id]);

  return (
    <div className="modal" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 0 }}>
      <div className="modal-content animate-fade-in" style={{ width: '100%', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '0', borderRadius: '1.25rem 1.25rem 0 0', display: 'flex', flexDirection: 'column' }}>
        
        {/* Sticky Header */}
        <div className="modal-header" style={{ padding: '1.25rem', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)', zIndex: 10, margin: 0 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                Order #{order.id.slice(0, 8).toUpperCase()}
              </h2>
              <span className={`modern-badge status-${order.status || 'pending'}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
              </span>
            </div>
            <p className="text-muted" style={{ fontSize: '0.75rem', margin: 0 }}>
              {new Date(order.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
          <button className="btn-close" onClick={onClose} style={{ background: '#F1F5F9', borderRadius: '50%', width: '36px', height: '36px', padding: 0, flexShrink: 0 }}><X size={18} /></button>
        </div>

        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Customer & Order Info Card */}
          <div style={{ background: '#F8FAFC', borderRadius: '1rem', padding: '1rem', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={16} color="var(--primary)" /> Order Details
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="text-muted" style={{ fontSize: '0.8125rem' }}>Customer</span>
                <span className="font-semibold text-main" style={{ fontSize: '0.8125rem', textAlign: 'right' }}>{customerLoading ? 'Loading...' : customerName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="text-muted" style={{ fontSize: '0.8125rem' }}>Phone</span>
                <span className="font-semibold text-main" style={{ fontSize: '0.8125rem', textAlign: 'right' }}>{customerLoading ? 'Loading...' : customerPhone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="text-muted" style={{ fontSize: '0.8125rem' }}>Type</span>
                <span className="font-semibold text-main capitalize" style={{ fontSize: '0.8125rem', textAlign: 'right' }}>
                  {order.order_type === 'pre-booking' ? 'Pre Booking' : order.order_type}
                </span>
              </div>
              
              {isPreBookingOrTakeaway && (
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className="text-muted" style={{ fontSize: '0.8125rem' }}>Expected</span>
                  <span className="font-semibold text-main" style={{ fontSize: '0.8125rem', textAlign: 'right' }}>{expectedTime || 'Not provided'}</span>
                </div>
              )}

              {isDineIn && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="text-muted" style={{ fontSize: '0.8125rem' }}>Guests</span>
                    <span className="font-semibold text-main" style={{ fontSize: '0.8125rem', textAlign: 'right' }}>{peopleCount || 'Not provided'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="text-muted" style={{ fontSize: '0.8125rem' }}>Expected Time</span>
                    <span className="font-semibold text-main" style={{ fontSize: '0.8125rem', textAlign: 'right' }}>{expectedTime || 'Not provided'}</span>
                  </div>
                  {reservationDate && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className="text-muted" style={{ fontSize: '0.8125rem' }}>Date</span>
                      <span className="font-semibold text-main" style={{ fontSize: '0.8125rem', textAlign: 'right' }}>{new Date(reservationDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Items List */}
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag size={16} color="var(--primary)" /> Items ({items.length})
            </h3>

            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B', fontSize: '0.875rem' }}>Loading items...</div>
            ) : items.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B', background: '#F8FAFC', borderRadius: '0.75rem', fontSize: '0.875rem' }}>No items found.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', border: '1px solid #E2E8F0', borderRadius: '0.875rem', background: 'white' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '0.5rem', overflow: 'hidden', background: '#F1F5F9', flexShrink: 0 }}>
                      {item.menu_items?.image ? (
                        <img src={item.menu_items.image} alt={item.menu_items.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '0.6rem' }}>No Img</div>
                      )}
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.15rem' }}>
                        <h4 className="font-semibold text-main" style={{ fontSize: '0.875rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '0.5rem' }}>
                          {item.menu_items?.name || 'Unknown Item'}
                        </h4>
                        <span className="font-bold text-main" style={{ fontSize: '0.875rem' }}>
                          ₹{(item.portion === 'half' ? item.menu_items?.half_price : item.portion === 'full' ? item.menu_items?.full_price : item.menu_items?.price) * item.quantity}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {item.quantity} x ₹{item.portion === 'half' ? item.menu_items?.half_price : item.portion === 'full' ? item.menu_items?.full_price : item.menu_items?.price}
                        </span>
                        {item.portion && (
                          <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.35rem', background: '#F1F5F9', color: '#475569', borderRadius: '0.25rem', textTransform: 'capitalize' }}>
                            {item.portion}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
        
        {/* Fixed Bottom Total Summary */}
        <div style={{ padding: '1.25rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', marginTop: 'auto', position: 'sticky', bottom: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Amount</span>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10B981' }}>₹{order.total_amount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function OtpVerifyModal({ order, onClose, onSuccess }: { order: any, onClose: () => void, onSuccess: () => void }) {
  const [otpInput, setOtpInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (otpInput.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', order.id)
        .eq('otp', otpInput)
        .single();

      if (fetchError || !data) {
        setError("Invalid OTP. Please check with the customer.");
        setLoading(false);
        return;
      }

      if (data.otp_expires_at && new Date(data.otp_expires_at) < new Date()) {
        setError("OTP has expired. Ask customer to regenerate.");
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'completed',
          otp_verified_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (updateError) throw updateError;

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center', padding: '0' }}>
        <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <h2 style={{ fontSize: '1.25rem' }}>Verify Order OTP</h2>
          <button className="btn-close" onClick={onClose}><X /></button>
        </div>
        <form onSubmit={handleVerify} style={{ padding: '1.5rem 2rem' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Enter the 6-digit OTP provided by the customer to complete order #{order.id.slice(0, 8).toUpperCase()}
          </p>

          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otpInput}
            onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
            autoFocus
            style={{
              width: '100%',
              textAlign: 'center',
              fontSize: '2rem',
              letterSpacing: '0.5em',
              padding: '1rem',
              borderRadius: '0.75rem',
              border: '2px solid #E2E8F0',
              marginBottom: '1rem',
              outline: 'none'
            }}
            placeholder="------"
          />

          {error && <p style={{ color: '#DC2626', fontSize: '0.875rem', marginBottom: '1rem', fontWeight: 500 }}>{error}</p>}

          <button
            type="submit"
            disabled={loading || otpInput.length !== 6}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.875rem', fontSize: '1rem' }}
          >
            {loading ? 'Verifying...' : 'Verify OTP & Complete Order'}
          </button>
        </form>
      </div>
    </div>
  );
}

function MenuManagementView({ menuItems, fetchMenu, restaurantId }: { menuItems: any[], fetchMenu: () => void, restaurantId?: string }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Menu</h2>
            <p className="text-muted" style={{ fontSize: '0.75rem' }}>{filteredItems.length} items</p>
          </div>
          <button className="btn btn-primary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.8125rem' }} onClick={() => { setEditingItem(null); setModalOpen(true); }}>
            <Plus size={15} /> Add
          </button>
        </div>

        <div style={{ marginBottom: '0.625rem' }}>
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.4rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.8125rem' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.75rem', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {['all', 'veg', 'non-veg'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                textTransform: 'capitalize',
                padding: '0.3rem 0.75rem',
                borderRadius: '1rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                background: selectedCategory === cat ? 'var(--primary)' : 'white',
                border: '1px solid #E2E8F0',
                color: selectedCategory === cat ? 'white' : 'var(--text-muted)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <div className="content-card" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
            No menu items found.
          </div>
        ) : filteredItems.map((item, idx) => (
          <div key={item.id} className="menu-card-mobile table-row-animate" style={{ animationDelay: `${idx * 0.03}s` }}>
            <div className="menu-card-img">
              {item.image ? <img src={item.image} alt={item.name} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '0.6875rem' }}>No img</div>}
            </div>
            <div className="menu-card-body">
              <div className="menu-card-name">{item.name}</div>
              <div className="menu-card-desc">{item.description}</div>
              <div className="menu-card-meta">
                <span className={`modern-badge ${item.category === 'veg' ? 'status-confirmed' : 'status-cancelled'}`} style={{ textTransform: 'uppercase', fontSize: '0.6rem' }}>{item.category}</span>
                <span className="type-badge">{item.food_type}</span>
                <span style={{ fontWeight: 700, fontSize: '0.8125rem' }}>
                  {item.has_portions ? `H:₹${item.half_price} F:₹${item.full_price}` : `₹${item.price}`}
                </span>
              </div>
              <div className="menu-card-actions">
                <button className="action-btn success" onClick={() => { setEditingItem(item); setModalOpen(true); }}><Edit2 size={15} /></button>
                <button className="action-btn danger" onClick={() => deleteItem(item.id)}><Trash2 size={15} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <MenuModal
          item={editingItem}
          restaurantId={restaurantId}
          onClose={() => setModalOpen(false)}
          onSave={() => { setModalOpen(false); fetchMenu(); }}
        />
      )}
    </>
  );

  async function deleteItem(id: string) {
    if (!confirm('Delete this item?')) return;
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (!error) fetchMenu();
  }
}



function AnalyticsView({ orders }: { orders: any[] }) {
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const avgOrderValue = orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : 0;

  return (
    <div className="animate-fade-in">
      <div className="stats-grid">
        <StatCard icon={IndianRupee} gradient="linear-gradient(135deg, #10B981 0%, #059669 100%)" title="Revenue" value={`₹${totalRevenue.toLocaleString()}`} />
        <StatCard icon={ShoppingBag} gradient="linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)" title="Avg Value" value={`₹${avgOrderValue}`} />
        <StatCard icon={Users} gradient="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)" title="Customers" value={orders.length} />
      </div>
      <div className="content-card" style={{ marginTop: '0.75rem', padding: '2.5rem 1rem', textAlign: 'center' }}>
        <BarChart2 size={36} color="var(--primary)" style={{ opacity: 0.2, marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '0.9375rem', marginBottom: '0.35rem' }}>Analytics coming soon</h3>
        <p className="text-muted" style={{ fontSize: '0.8125rem' }}>Performance metrics will appear here.</p>
      </div>
    </div>
  )
}

function SettingsView({ restaurant, fetchRestaurant, onProfileCompleted }: { restaurant: any, fetchRestaurant: () => Promise<any> | void, onProfileCompleted?: () => void }) {
  const [formData, setFormData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [openTime, setOpenTime] = useState('10:00');
  const [closeTime, setCloseTime] = useState('23:00');
  const [mapPosition, setMapPosition] = useState<any>(null);

  function parseOpeningHours(value: string | null | undefined) {
    const raw = (value || '').trim();
    const match = raw.match(/(\d{1,2}):(\d{2}).*?(\d{1,2}):(\d{2})/);
    if (!match) return { open: '10:00', close: '23:00' };
    return {
      open: `${match[1].padStart(2, '0')}:${match[2]}`,
      close: `${match[3].padStart(2, '0')}:${match[4]}`
    };
  }

  useEffect(() => {
    const base = restaurant || {
      name: '',
      cuisine: '',
      location: '',
      latitude: null,
      longitude: null,
      opening_hours: '',
      phone: '',
      prep_time: '',
      rating: '',
      description: '',
      image: '',
      services: { preBooking: true, takeaway: true, dineIn: true },
    };
    setFormData({ ...base });
    const parsed = parseOpeningHours(base.opening_hours);
    setOpenTime(parsed.open);
    setCloseTime(parsed.close);

    if (base.latitude && base.longitude) {
      setMapPosition({ lat: parseFloat(base.latitude), lng: parseFloat(base.longitude) });
    } else {
      setMapPosition(null);
    }
  }, [restaurant]);

  const handleLocationUpdate = async (lat: number, lng: number) => {
    setFormData((prev: any) => ({ ...prev, latitude: lat, longitude: lng }));
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      if (data && data.display_name) {
        setFormData((prev: any) => ({ ...prev, location: data.display_name, latitude: lat, longitude: lng }));
      }
    } catch (e) {
      console.error("Reverse geocoding failed", e);
    }
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setMapPosition({ lat, lng });
          handleLocationUpdate(lat, lng);
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Could not get current location. Please allow location access or click on the map.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  if (!formData) return null;

  return (
    <div className="content-card animate-fade-in" style={{ background: 'white' }}>
      <div className="card-header" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 'bold', color: '#1E293B' }}>Restaurant Profile</h2>
          {saveMessage && (
            <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: saveMessage.type === 'success' ? '#059669' : '#DC2626' }}>
              {saveMessage.text}
            </p>
          )}
        </div>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={isSaving}
          style={{ padding: '0.4rem 0.875rem', fontSize: '0.8125rem', opacity: isSaving ? 0.7 : 1 }}
        >
          <Save size={14} /> {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
      <div className="admin-form" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-row">
          <div className="form-group">
            <label>Restaurant Name</label>
            <input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Cuisine Type</label>
            <input value={formData.cuisine || ''} onChange={e => setFormData({ ...formData, cuisine: e.target.value })} />
          </div>
        </div>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ margin: 0 }}>Restaurant Location</label>
            <button
              type="button"
              onClick={handleLocateMe}
              className="btn btn-ghost"
              style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem', color: '#10B981', border: '1px solid #10B981', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '0.5rem' }}
            >
              📍 Use Current Location
            </button>
          </div>
          <div style={{ height: '200px', width: '100%', borderRadius: '0.625rem', overflow: 'hidden', marginBottom: '0.75rem', border: '1px solid #E2E8F0', zIndex: 0 }}>
            <MapContainer center={mapPosition || { lat: 20.5937, lng: 78.9629 }} zoom={mapPosition ? 15 : 4} style={{ height: '100%', width: '100%', zIndex: 1 }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
              />
              <MapPanController position={mapPosition} />
              <LocationMarker position={mapPosition} setPosition={setMapPosition} onLocationUpdate={handleLocationUpdate} />
            </MapContainer>
          </div>
          <textarea
            placeholder="Address will auto-fill when you click on the map..."
            value={formData.location || ''}
            onChange={e => setFormData({ ...formData, location: e.target.value })}
            rows={2}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #E2E8F0', outline: 'none' }}
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Opening Hours</label>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input type="time" value={openTime} onChange={e => setOpenTime(e.target.value)} />
              <span style={{ color: '#64748B', fontWeight: 600 }}>to</span>
              <input type="time" value={closeTime} onChange={e => setCloseTime(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Contact Phone</label>
            <input value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Preparation Time</label>
            <input placeholder="20-25 min" value={formData.prep_time || ''} onChange={e => setFormData({ ...formData, prep_time: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Rating (Display only)</label>
            <input readOnly style={{ backgroundColor: '#F8FAFC', color: '#64748B' }} value={formData.rating || ''} />
          </div>
        </div>
        <div className="form-group">
          <label>Restaurant Description</label>
          <textarea value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={4} />
        </div>
        <div className="form-group">
          <label>Cover Image URL</label>
          <input value={formData.image || ''} onChange={e => setFormData({ ...formData, image: e.target.value })} />
        </div>
        <div className="form-group">
          <label style={{ marginBottom: '0.5rem' }}>Enabled Services</label>
          <div className="services-toggles" style={{ display: 'flex', gap: '2rem', background: '#F8FAFC', padding: '1.25rem', borderRadius: '0.75rem' }}>
            <label className="checkbox-label">
              <input type="checkbox" checked={formData.services?.preBooking || false} onChange={e => setFormData({ ...formData, services: { ...formData.services, preBooking: e.target.checked } })} /> Pre-Order
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={formData.services?.takeaway || false} onChange={e => setFormData({ ...formData, services: { ...formData.services, takeaway: e.target.checked } })} /> Takeaway
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={formData.services?.dineIn || false} onChange={e => setFormData({ ...formData, services: { ...formData.services, dineIn: e.target.checked } })} /> Dine-In
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  async function handleSave() {
    try {
      setIsSaving(true);
      setSaveMessage(null);

      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      // Prepare payload to match database schema
      const submissionData = { ...formData };

      if (userId) {
        submissionData.owner_id = userId;
      }

      // Handle opening hours
      submissionData.opening_hours = `${openTime} - ${closeTime}`;

      // Fix numeric rating (Postgres DECIMAL cannot be "")
      if (submissionData.rating === "" || submissionData.rating === null || submissionData.rating === undefined) {
        submissionData.rating = 5.0; // Default rating
      } else {
        const parsedRating = parseFloat(submissionData.rating);
        submissionData.rating = isNaN(parsedRating) ? 5.0 : parsedRating;
      }

      // Ensure required fields for NOT NULL constraints
      if (!submissionData.image) {
        submissionData.image = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80';
      }

      if (!submissionData.distance) {
        submissionData.distance = '0.5 km';
      }

      const timeoutMs = 15000;
      const withTimeout = <T,>(promise: Promise<T>, label: string) =>
        Promise.race<T>([
          promise,
          new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs / 1000}s`)), timeoutMs)
          ),
        ]);

      const isNew = !formData.id;
      const query = isNew
        ? supabase.from('restaurants').insert(submissionData).select('*').single()
        : supabase.from('restaurants').update(submissionData).eq('id', formData.id).select('*').single();

      const { data, error } = await withTimeout(Promise.resolve(query), 'Save request');

      if (error) throw error;
      if (!data) {
        throw new Error('No restaurant row was updated. Check restaurant ID and update permissions (RLS policy).');
      }

      // If this was a new restaurant, link it to the adminProfile
      if (isNew && data.id && userId) {
        const { error: adminProfileError } = await supabase
          .from('adminProfile')
          .update({ restaurant_id: data.id })
          .eq('id', userId);

        if (adminProfileError) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ restaurant_id: data.id } as any)
            .eq('id', userId);
          if (profileError) {
            console.error('Failed to link restaurant_id to adminProfile/profiles:', { adminProfileError, profileError });
          }
        }
      }

      setFormData({ ...data });
      await Promise.resolve(fetchRestaurant());
      setSaveMessage({ type: 'success', text: 'Settings saved successfully.' });
      if (isRestaurantProfileComplete(data)) {
        onProfileCompleted?.();
      }
    } catch (err: any) {
      console.error('Error saving restaurant settings:', err);
      const message = String(err?.message || '');
      if (err?.code === '42501' || message.toLowerCase().includes('row-level security')) {
        setSaveMessage({ type: 'error', text: 'Database RLS blocked this action. Apply admin-panel/supabase/admin-panel-rls.sql in Supabase SQL Editor, then try again.' });
      } else
        if (String(err?.message || '').toLowerCase().includes('timed out')) {
          setSaveMessage({ type: 'error', text: 'Save request timed out after 15s. Please check your Supabase network/RLS setup.' });
        } else {
          setSaveMessage({ type: 'error', text: err.message || 'Failed to save settings.' });
        }
    } finally {
      setIsSaving(false);
    }
  }
}

// Utils
function StatCard({ icon: Icon, bg, gradient, color, title, value }: any) {
  return (
    <div className="stat-card premium-stat-card" style={gradient ? { background: gradient, color: 'white' } : {}}>
      <div className="stat-icon premium-stat-icon" style={gradient ? { backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' } : { backgroundColor: bg, color }}>
        <Icon size={24} />
      </div>
      <div className="stat-info">
        <h3 style={gradient ? { color: 'rgba(255,255,255,0.8)' } : {}}>{title}</h3>
        <p style={gradient ? { color: 'white' } : {}}>{value}</p>
      </div>
      {gradient && <div className="stat-card-glow" style={{ background: gradient }}></div>}
    </div>
  );
}

function MenuModal({ item, restaurantId, onClose, onSave }: any) {
  const [formData, setFormData] = useState<any>(item || {
    name: '',
    description: '',
    category: 'veg',
    food_type: 'starter',
    has_portions: false,
    price: 0,
    half_price: 0,
    full_price: 0,
    image: '',
    restaurant_id: restaurantId || null,
    is_countable: true
  });

  async function handleSubmit(e: any) {
    e.preventDefault();
    try {
      const submissionData = { ...formData };
      if (submissionData.has_portions) {
        submissionData.price = null;
      } else {
        submissionData.half_price = null;
        submissionData.full_price = null;
      }

      const result = item
        ? await supabase.from('menu_items').update(submissionData).eq('id', item.id)
        : await supabase.from('menu_items').insert(submissionData);

      if (result.error) {
        console.error('Supabase error:', result.error);
        alert('Error: ' + result.error.message);
      } else {
        onSave();
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      alert('An unexpected error occurred: ' + err.message);
    }
  }

  return (
    <div className="modal" style={{ display: 'flex' }}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>{item ? 'Edit Item' : 'Add Item'}</h2>
          <button className="btn-close" onClick={onClose}><X /></button>
        </div>
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label>Name</label>
            <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={2} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                <option value="veg">Veg</option>
                <option value="non-veg">Non-Veg</option>
              </select>
            </div>
            <div className="form-group">
              <label>Type</label>
              <select value={formData.food_type} onChange={e => setFormData({ ...formData, food_type: e.target.value })}>
                <option value="starter">Starter</option>
                <option value="main">Main Course</option>
                <option value="bread">Bread</option>
                <option value="dessert">Dessert</option>
                <option value="beverage">Beverage</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input type="checkbox" checked={formData.has_portions} onChange={e => setFormData({ ...formData, has_portions: e.target.checked })} /> Half/Full Portions
            </label>
          </div>
          {!formData.has_portions ? (
            <div className="form-group">
              <label>Price (₹)</label>
              <input type="number" required value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} />
            </div>
          ) : (
            <div className="form-row">
              <div className="form-group">
                <label>Half Price (₹)</label>
                <input type="number" required value={formData.half_price} onChange={e => setFormData({ ...formData, half_price: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="form-group">
                <label>Full Price (₹)</label>
                <input type="number" required value={formData.full_price} onChange={e => setFormData({ ...formData, full_price: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
          )}
          <div className="form-group">
            <label>Image URL</label>
            <input type="url" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Item</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LocationMarker({ position, setPosition, onLocationUpdate }: any) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationUpdate(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

function MapPanController({ position }: { position: any }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 16);
    }
  }, [position, map]);
  return null;
}
