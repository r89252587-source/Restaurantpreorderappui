import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, BookOpen, Store, BarChart2,
  Users, LogOut, Utensils, Bell, Package, Clock, 
  RefreshCw, Check, X, Plus, Edit2, Trash2, Save, IndianRupee, Menu
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Dashboard({ session: _session, profile, onSignOut }: { session: any, profile: any, onSignOut: () => Promise<any> | void }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    fetchMenu();
    fetchRestaurantData();
  }, []);

  async function fetchOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
    }
  }

  async function fetchMenu() {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setMenuItems(data || []);
    } catch (err: any) {
      console.error('Error fetching menu:', err);
    }
  }

  async function fetchRestaurantData() {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      setRestaurant(data || null);
    } catch (err: any) {
      console.error('Error fetching restaurant:', err);
    }
  }

  // default to dashboard if root
  const currentPath = location.pathname.split('/')[1] || 'dashboard';

  return (
    <div className="dashboard-layout">
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)}></div>
      <Sidebar 
        currentView={currentPath} 
        setView={(v) => { navigate(v === 'dashboard' ? '/' : `/${v}`); setSidebarOpen(false); }} 
        onSignOut={onSignOut} 
        isOpen={sidebarOpen}
      />
      <main className="main-content">
        <Header 
          viewTitle={currentPath} 
          userProfile={profile} 
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <Routes>
          <Route path="/" element={<DashboardView orders={orders} fetchOrders={fetchOrders} />} />
          <Route path="/orders" element={<OrdersView orders={orders} fetchOrders={fetchOrders} />} />
          <Route path="/menu" element={<MenuManagementView menuItems={menuItems} fetchMenu={fetchMenu} restaurantId={restaurant?.id} />} />
          <Route path="/restaurants" element={<SettingsView restaurant={restaurant} fetchRestaurant={fetchRestaurantData} />} />
          <Route path="/analytics" element={<AnalyticsView orders={orders} />} />
        </Routes>
      </main>
    </div>
  );
}


function Sidebar({ currentView, setView, onSignOut, isOpen }: { currentView: string, setView: (v: string) => void, onSignOut: () => void, isOpen: boolean }) {
  const links: { id: string, icon: any, label: string }[] = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'orders', icon: ShoppingBag, label: 'Orders' },
    { id: 'menu', icon: BookOpen, label: 'Menu Management' },
    { id: 'restaurants', icon: Store, label: 'Restaurants' },
    { id: 'analytics', icon: BarChart2, label: 'Analytics' },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="logo">
        <Utensils />
        <span>QuickBite</span>
      </div>
      <ul className="nav-links">
        {links.map(link => (
          <li key={link.id} className="nav-item">
            <button 
              onClick={() => setView(link.id)} 
              className={`nav-link ${currentView === link.id ? 'active' : ''}`}
            >
              <link.icon size={20} />
              <span>{link.label}</span>
            </button>
          </li>
        ))}
      </ul>
      <ul className="nav-links" style={{ marginTop: 'auto', flex: 0 }}>
        <li className="nav-item">
          <button onClick={onSignOut} className="nav-link logout-link">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </li>
      </ul>
    </aside>
  );
}

function Header({ viewTitle, userProfile, onMenuClick }: { viewTitle: string, userProfile: any, onMenuClick: () => void }) {
  const titles: Record<string, string> = {
    dashboard: 'Dashboard Overview',
    orders: 'Orders Management',
    menu: 'Menu Management',
    restaurants: 'Restaurant Settings',
    analytics: 'Analytics & Reports'
  };

  return (
    <header>
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuClick}>
          <Menu size={24} />
        </button>
        <div className="header-title">
          <h1>{titles[viewTitle] || 'Dashboard'}</h1>
          <p className="welcome-text">Welcome back, Admin</p>
        </div>
      </div>
      <div className="user-profile">
        <div className="notifications hide-mobile">
          <button className="btn btn-ghost">
            <Bell size={20} />
          </button>
        </div>
        <div className="avatar">
          {userProfile?.avatar_url ? <img src={userProfile.avatar_url} style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : 'AD'}
        </div>
      </div>
    </header>
  );
}

// Data Views
function DashboardView({ orders, fetchOrders }: { orders: any[], fetchOrders: () => void }) {
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="dashboard-view-container animate-fade-in">
      <div className="stats-grid premium">
        <StatCard 
          icon={Package} 
          gradient="linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)"
          color="#ffffff" 
          title="Total Orders" 
          value={orders.length} 
        />
        <StatCard 
          icon={IndianRupee} 
          gradient="linear-gradient(135deg, #10B981 0%, #059669 100%)"
          color="#ffffff" 
          title="Total Revenue" 
          value={`₹${totalRevenue.toLocaleString()}`} 
        />
        <StatCard 
          icon={Clock} 
          gradient="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
          color="#ffffff" 
          title="Pending Orders" 
          value={pendingCount} 
        />
      </div>
      
      <div className="content-card premium-card">
        <div className="card-header modern">
          <div>
            <h2 className="text-lg font-bold">Recent Orders</h2>
            <p className="text-muted text-sm">Real-time order tracking</p>
          </div>
          <button className="btn btn-primary premium-hover" onClick={fetchOrders}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
        <OrdersTable orders={orders.slice(0, 5)} onUpdate={fetchOrders} />
      </div>
    </div>
  );
}

function OrdersView({ orders, fetchOrders }: { orders: any[], fetchOrders: () => void }) {
  return (
    <div className="animate-fade-in">
      <div className="content-card premium-card">
        <div className="card-header modern">
          <div>
            <h2 className="text-lg font-bold">All Orders</h2>
            <p className="text-muted text-sm">Full order history and status</p>
          </div>
          <button className="btn btn-primary premium-hover" onClick={fetchOrders}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
        <OrdersTable orders={orders} onUpdate={fetchOrders} />
      </div>
    </div>
  );
}

function OrdersTable({ orders, onUpdate }: { orders: any[], onUpdate: () => void }) {
  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (!error) onUpdate();
  }

  return (
    <div className="table-responsive">
      <table className="modern-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
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
            <tr key={order.id} style={{ animationDelay: `${idx * 0.05}s` }} className="table-row-animate">
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
              <td className="text-muted">{new Date(order.created_at).toLocaleDateString()}</td>
              <td>
                <div className="action-buttons">
                  <button className="action-btn success tooltip" data-tip="Confirm" onClick={() => updateStatus(order.id, 'confirmed')}><Check size={16} /></button>
                  <button className="action-btn danger tooltip" data-tip="Cancel" onClick={() => updateStatus(order.id, 'cancelled')}><X size={16} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
      <div className="content-card premium-card animate-fade-in">
        <div className="card-header modern" style={{ paddingBottom: '2rem' }}>
          <div>
            <h2 className="text-lg font-bold">Menu Inventory</h2>
            <p className="text-muted text-sm">Manage your restaurant offerings</p>
          </div>
          <button className="btn btn-primary premium-hover" onClick={() => { setEditingItem(null); setModalOpen(true); }}>
            <Plus size={16} /> Add New Item
          </button>
        </div>

        <div className="filters-bar" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div className="search-wrapper" style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
             <input 
               type="text" 
               placeholder="Search items..." 
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid #E2E8F0', outline: 'none' }}
             />
          </div>
          <div className="category-filters" style={{ display: 'flex', gap: '0.5rem' }}>
            {['all', 'veg', 'non-veg'].map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`btn ${selectedCategory === cat ? 'btn-primary' : ''}`}
                style={{ textTransform: 'capitalize', padding: '0.75rem 1.5rem', background: selectedCategory === cat ? 'var(--primary)' : 'white', border: '1px solid #E2E8F0', color: selectedCategory === cat ? 'white' : 'var(--text-main)' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Item Details</th>
                <th>Category</th>
                <th>Food Type</th>
                <th>Price</th>
                <th>Portions</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    No menu items found.
                  </td>
                </tr>
              ) : filteredItems.map((item, idx) => (
                <tr key={item.id} style={{ animationDelay: `${idx * 0.03}s` }} className="table-row-animate">
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '0.75rem', overflow: 'hidden', background: '#f1f5f9' }}>
                        <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div>
                        <p style={{ fontWeight: '700', color: 'var(--text-main)' }}>{item.name}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.description}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`modern-badge ${item.category === 'veg' ? 'status-confirmed' : 'status-cancelled'}`} style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                      {item.category}
                    </span>
                  </td>
                  <td>
                    <span className="text-muted" style={{ textTransform: 'capitalize' }}>{item.food_type}</span>
                  </td>
                  <td style={{ fontWeight: '700' }}>
                    {item.has_portions ? (
                      <div style={{ fontSize: '0.85rem' }}>
                        <div>H: ₹{item.half_price}</div>
                        <div>F: ₹{item.full_price}</div>
                      </div>
                    ) : `₹${item.price}`}
                  </td>
                  <td>
                    <span className={`modern-badge ${item.has_portions ? 'status-preparing' : 'status-pending'}`}>
                      {item.has_portions ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn success tooltip" data-tip="Edit" onClick={() => { setEditingItem(item); setModalOpen(true); }}><Edit2 size={16} /></button>
                      <button className="action-btn danger tooltip" data-tip="Delete" onClick={() => deleteItem(item.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
       <div className="stats-grid premium">
          <StatCard icon={IndianRupee} gradient="linear-gradient(135deg, #10B981 0%, #059669 100%)" title="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} />
          <StatCard icon={ShoppingBag} gradient="linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)" title="Avg Order Value" value={`₹${avgOrderValue}`} />
          <StatCard icon={Users} gradient="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)" title="Total Customers" value={orders.length} />
       </div>
       <div className="content-card" style={{ marginTop: '2rem', padding: '4rem 2rem', textAlign: 'center' }}>
          <BarChart2 size={48} color="var(--primary)" style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>Analytics charts coming soon</h3>
          <p className="text-muted">Detailed performance metrics and trends will be displayed here.</p>
       </div>
    </div>
  )
}

function SettingsView({ restaurant, fetchRestaurant }: { restaurant: any, fetchRestaurant: () => Promise<void> | void }) {
  const [formData, setFormData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [openTime, setOpenTime] = useState('10:00');
  const [closeTime, setCloseTime] = useState('23:00');

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
    if (restaurant) {
      setFormData({ ...restaurant });
      const parsed = parseOpeningHours(restaurant.opening_hours);
      setOpenTime(parsed.open);
      setCloseTime(parsed.close);
    }
  }, [restaurant]);

  if (!formData) return null;

  return (
    <div className="content-card premium-card animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', background: 'white', borderRadius: '1.25rem' }}>
      <div className="card-header modern" style={{ background: 'transparent', padding: '2rem 2.5rem', borderBottom: '1px solid #E2E8F0' }}>
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1E293B' }}>Restaurant Profile</h2>
          {saveMessage && (
            <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: saveMessage.type === 'success' ? '#059669' : '#DC2626' }}>
              {saveMessage.text}
            </p>
          )}
        </div>
        <button
          className="btn btn-primary premium-hover"
          onClick={handleSave}
          disabled={isSaving}
          style={{ background: '#FC0A3D', color: 'white', opacity: isSaving ? 0.7 : 1, cursor: isSaving ? 'not-allowed' : 'pointer' }}
        >
          <Save size={16} /> {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      <div className="admin-form" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
        <div className="form-group">
          <label>Location Address</label>
          <textarea value={formData.location || ''} onChange={e => setFormData({ ...formData, location: e.target.value })} rows={2} />
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
          <input value={formData.cover_image || ''} onChange={e => setFormData({ ...formData, cover_image: e.target.value })} />
        </div>
        <div className="form-group">
          <label style={{ marginBottom: '0.5rem' }}>Enabled Services</label>
          <div style={{ display: 'flex', gap: '2rem', background: '#F8FAFC', padding: '1.25rem', borderRadius: '0.75rem' }}>
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
      const payload = {
        ...formData,
        opening_hours: `${openTime} - ${closeTime}`
      };
      const timeoutMs = 15000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const { data, error } = await supabase
        .from('restaurants')
        .update(payload)
        .eq('id', formData.id)
        .select('id')
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No restaurant row was updated. Check restaurant ID and update permissions (RLS policy).');
      }

      await Promise.resolve(fetchRestaurant());
      setSaveMessage({ type: 'success', text: 'Settings saved successfully.' });
    } catch (err: any) {
      console.error('Error saving restaurant settings:', err);
      if (err?.name === 'AbortError') {
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
