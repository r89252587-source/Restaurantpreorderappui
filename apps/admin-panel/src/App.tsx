import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  BookOpen, 
  Users, 
  Settings, 
  LogOut, 
  Utensils, 
  Bell, 
  Package, 
  Clock, 
  RefreshCw, 
  Check, 
  X, 
  Plus, 
  Edit2, 
  Trash2, 
  Save,
  Loader2,
  IndianRupee
} from 'lucide-react';
import { supabase } from './lib/supabase';

// Types
type View = 'dashboard' | 'menu' | 'users' | 'settings';
type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'cancelled' | 'completed';

const RESTAURANT_ID = '11111111-1111-1111-1111-111111111111';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [orders, setOrders] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [restaurant, setRestaurant] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkUserRole(session.user);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) checkUserRole(session.user);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkUserRole(user: any) {
    try {
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata.full_name,
            avatar_url: user.user_metadata.avatar_url,
            role: 'pending'
          })
          .select()
          .single();
        if (createError) throw createError;
        profile = newProfile;
      }

      setProfile(profile);
      if (profile.role === 'admin') {
        loadAdminData();
      }
    } catch (error) {
      console.error('Error checking role:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadAdminData() {
    fetchOrders();
    fetchMenu();
    fetchRestaurantData();
    fetchUsers();
  }

  async function fetchOrders() {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setOrders(data || []);
  }

  async function fetchMenu() {
    const { data } = await supabase.from('menu_items').select('*').order('name');
    setMenuItems(data || []);
  }

  async function fetchUsers() {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setProfiles(data || []);
  }

  async function fetchRestaurantData() {
    const { data } = await supabase.from('restaurants').select('*').eq('id', RESTAURANT_ID).single();
    setRestaurant(data);
  }

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F8FAFC]">
        <Loader2 className="w-10 h-10 text-[#FF0031] animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <LoginView onLogin={loginWithGoogle} />;
  }

  if (profile?.role !== 'admin') {
    return <PendingAccessView onSignOut={() => supabase.auth.signOut()} />;
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar currentView={currentView} setView={setCurrentView} onSignOut={() => supabase.auth.signOut()} />
      <main className="flex-1 ml-[260px] p-8">
        <Header viewTitle={currentView} userProfile={profile} />
        
        {currentView === 'dashboard' && <DashboardView orders={orders} fetchOrders={fetchOrders} />}
        {currentView === 'menu' && <MenuManagementView menuItems={menuItems} fetchMenu={fetchMenu} />}
        {currentView === 'users' && <UserManagementView profiles={profiles} fetchUsers={fetchUsers} currentProfile={profile} />}
        {currentView === 'settings' && <SettingsView restaurant={restaurant} fetchRestaurant={fetchRestaurantData} />}
      </main>
    </div>
  );
}

// Sub-Views
function LoginView({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="login-container">
      <div className="login-mesh"></div>
      <div className="login-card">
        <div className="login-logo">
          <Utensils size={32} />
          <span>QuickBite Admin</span>
        </div>
        <h2 className="text-2xl font-black mb-3 text-[#1E293B]">Welcome back!</h2>
        <p className="text-[#64748B] mb-10 text-sm leading-relaxed">
          The ultimate platform to manage your restaurant orders, menu, and staff in one place.
        </p>
        
        <button onClick={onLogin} className="google-btn">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/layout/google.svg" width="20" alt="Google" />
          <span className="flex-1 text-center">Sign in with Google</span>
        </button>

        <div className="mt-12 pt-8 border-t border-dashed border-[#E2E8F0]">
          <p className="text-xs text-[#94A3B8]">
            Secure login powered by Supabase Auth
          </p>
        </div>
      </div>
    </div>
  );
}

function PendingAccessView({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center p-8 text-center z-[2000]">
      <div className="max-w-[400px] w-full p-12 rounded-[2rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)]">
        <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock size={40} />
        </div>
        <h2 className="text-xl font-bold mb-4">Access Pending</h2>
        <p className="text-[#64748B] mb-10">Your request is being reviewed by an administrator.</p>
        <button onClick={onSignOut} className="btn w-full justify-center">Sign Out</button>
      </div>
    </div>
  );
}

function Sidebar({ currentView, setView, onSignOut }: { currentView: View, setView: (v: View) => void, onSignOut: () => void }) {
  const links: { id: View, icon: any, label: string }[] = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'menu', icon: BookOpen, label: 'Menu Management' },
    { id: 'users', icon: Users, label: 'User Management' },
    { id: 'settings', icon: Settings, label: 'Restaurant Settings' },
  ];

  return (
    <aside className="sidebar">
      <div className="logo">
        <Utensils />
        <span>QuickBite</span>
      </div>
      <ul className="nav-links">
        {links.map(link => (
          <li key={link.id} className="nav-item">
            <button 
              onClick={() => setView(link.id)} 
              className={`nav-link w-full border-none bg-transparent cursor-pointer ${currentView === link.id ? 'active' : ''}`}
            >
              <link.icon size={20} />
              <span>{link.label}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="nav-links mt-auto">
        <li className="nav-item">
          <button onClick={onSignOut} className="nav-link w-full border-none bg-transparent cursor-pointer text-[#EF4444]">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </li>
      </div>
    </aside>
  );
}

function Header({ viewTitle, userProfile }: { viewTitle: string, userProfile: any }) {
  const titles = {
    dashboard: 'Dashboard Overview',
    menu: 'Menu Management',
    users: 'User Management',
    settings: 'Restaurant Settings'
  };

  return (
    <header>
      <div className="header-title">
        <h1 className="text-2xl font-bold">{titles[viewTitle as keyof typeof titles]}</h1>
        <p className="text-[#64748B] text-sm">Welcome back, Admin</p>
      </div>
      <div className="user-profile">
        <div className="notifications">
          <button className="p-2 text-[#64748B] hover:bg-white rounded-lg transition-colors">
            <Bell size={20} />
          </button>
        </div>
        <div className="avatar">
          {userProfile?.avatar_url ? <img src={userProfile.avatar_url} className="w-full h-full rounded-full" /> : 'AD'}
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
    <>
      <div className="stats-grid">
        <StatCard icon={Package} bg="#E0F2FE" color="#0EA5E9" title="Total Orders" value={orders.length} />
        <StatCard icon={IndianRupee} bg="#DCFCE7" color="#10B981" title="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} />
        <StatCard icon={Clock} bg="#FEF3C7" color="#F59E0B" title="Pending Orders" value={pendingCount} />
      </div>
      
      <div className="content-card">
        <div className="card-header">
          <h2 className="text-lg font-bold">Recent Orders</h2>
          <button className="btn btn-primary" onClick={fetchOrders}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td className="font-bold">#{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="capitalize">{order.order_type.replace('-', ' ')}</td>
                  <td className="font-bold">₹{order.total_amount}</td>
                  <td><span className={`status-badge status-${order.status || 'pending'}`}>{order.status || 'Pending'}</span></td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="p-2 bg-[#F8FAFC] rounded-lg" onClick={() => updateStatus(order.id, 'confirmed')}><Check size={16} color="#10B981" /></button>
                      <button className="p-2 bg-[#F8FAFC] rounded-lg" onClick={() => updateStatus(order.id, 'cancelled')}><X size={16} color="#EF4444" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (!error) fetchOrders();
  }
}

function MenuManagementView({ menuItems, fetchMenu }: { menuItems: any[], fetchMenu: () => void }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  return (
    <>
      <div className="content-card">
        <div className="card-header">
          <h2 className="text-lg font-bold">Menu Items</h2>
          <button className="btn btn-primary" onClick={() => { setEditingItem(null); setModalOpen(true); }}>
            <Plus size={16} /> Add Item
          </button>
        </div>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map(item => (
                <tr key={item.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <img src={item.image} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="font-bold">{item.name}</p>
                        <p className="text-xs text-[#64748B]">{item.food_type}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="status-badge bg-[#F1F5F9] text-[#475569]">{item.category}</span></td>
                  <td className="font-bold">
                    {item.has_portions ? `H: ₹${item.half_price} / F: ₹${item.full_price}` : `₹${item.price}`}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="p-2 bg-[#F8FAFC] rounded-lg" onClick={() => { setEditingItem(item); setModalOpen(true); }}><Edit2 size={16} color="#6366F1" /></button>
                      <button className="p-2 bg-[#F8FAFC] rounded-lg" onClick={() => deleteItem(item.id)}><Trash2 size={16} color="#EF4444" /></button>
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

function UserManagementView({ profiles, fetchUsers, currentProfile }: { profiles: any[], fetchUsers: () => void, currentProfile: any }) {
  return (
    <div className="content-card">
      <div className="card-header">
        <div>
          <h2 className="text-lg font-bold">Access Requests & Roles</h2>
          <p className="text-sm text-[#64748B]">Manage admin panel access</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map(p => (
              <tr key={p.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <img src={p.avatar_url} className="w-10 h-10 rounded-full" />
                    <p className="font-bold">{p.full_name}</p>
                  </div>
                </td>
                <td><span className={`status-badge ${p.role === 'admin' ? 'status-confirmed' : 'status-pending'}`}>{p.role.toUpperCase()}</span></td>
                <td>{new Date(p.created_at).toLocaleDateString()}</td>
                <td>
                  {p.id !== currentProfile?.id && (
                    <button 
                      className={`btn text-xs py-2 ${p.role === 'admin' ? 'bg-red-50 text-red-600' : 'btn-primary'}`}
                      onClick={() => updateRole(p.id, p.role === 'admin' ? 'user' : 'admin')}
                    >
                      {p.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  async function updateRole(id: string, role: string) {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
    if (!error) fetchUsers();
  }
}

function SettingsView({ restaurant, fetchRestaurant }: { restaurant: any, fetchRestaurant: () => void }) {
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (restaurant) setFormData({ ...restaurant });
  }, [restaurant]);

  if (!formData) return null;

  return (
    <div className="content-card max-w-[800px] mx-auto">
      <div className="card-header">
        <h2 className="text-lg font-bold">Restaurant Profile</h2>
        <button className="btn btn-primary" onClick={handleSave}><Save size={16} /> Save Changes</button>
      </div>
      <div className="p-8 space-y-6">
        <div className="form-row">
          <div className="form-group">
            <label>Name</label>
            <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Cuisine</label>
            <input value={formData.cuisine} onChange={e => setFormData({ ...formData, cuisine: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label>Address</label>
          <textarea value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} rows={2} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Hours</label>
            <input value={formData.opening_hours || ''} onChange={e => setFormData({ ...formData, opening_hours: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label className="mb-2">Services</label>
          <div className="flex gap-6 bg-[#F8FAFC] p-4 rounded-xl">
            <label className="checkbox-label">
              <input type="checkbox" checked={formData.services?.preBooking} onChange={e => setFormData({ ...formData, services: { ...formData.services, preBooking: e.target.checked } })} /> Pre-Order
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={formData.services?.takeaway} onChange={e => setFormData({ ...formData, services: { ...formData.services, takeaway: e.target.checked } })} /> Takeaway
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={formData.services?.dineIn} onChange={e => setFormData({ ...formData, services: { ...formData.services, dineIn: e.target.checked } })} /> Dine-In
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  async function handleSave() {
    const { error } = await supabase.from('restaurants').update(formData).eq('id', RESTAURANT_ID);
    if (!error) {
      alert('Settings saved!');
      fetchRestaurant();
    }
  }
}

// Utils
function StatCard({ icon: Icon, bg, color, title, value }: any) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: bg, color }}>
        <Icon size={24} />
      </div>
      <div className="stat-info">
        <h3>{title}</h3>
        <p>{value}</p>
      </div>
    </div>
  );
}

function MenuModal({ item, onClose, onSave }: any) {
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
    restaurant_id: RESTAURANT_ID,
    is_countable: true
  });

  async function handleSubmit(e: any) {
    e.preventDefault();
    const result = item 
      ? await supabase.from('menu_items').update(formData).eq('id', item.id)
      : await supabase.from('menu_items').insert(formData);
    
    if (!result.error) onSave();
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
              <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })} />
            </div>
          ) : (
            <div className="form-row">
              <div className="form-group">
                <label>Half Price (₹)</label>
                <input type="number" value={formData.half_price} onChange={e => setFormData({ ...formData, half_price: parseFloat(e.target.value) })} />
              </div>
              <div className="form-group">
                <label>Full Price (₹)</label>
                <input type="number" value={formData.full_price} onChange={e => setFormData({ ...formData, full_price: parseFloat(e.target.value) })} />
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
