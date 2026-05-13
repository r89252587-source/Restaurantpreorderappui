// Supabase Configuration
const SUPABASE_URL = 'https://yczzrgowkbaolkcmudvx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_UiFLTQw38cUsMU6tchu04w_zEHxf6uG';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// State
let orders = [];

// DOM Elements
const ordersBody = document.getElementById('orders-body');
const statTotalOrders = document.getElementById('stat-total-orders');
const statRevenue = document.getElementById('stat-revenue');
const statPending = document.getElementById('stat-pending');

// Initialize
async function init() {
  await fetchOrders();
  setupRealtime();
}

// Fetch Orders
async function fetchOrders() {
  try {
    const { data, error } = await supabaseClient
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    orders = data || [];
    renderDashboard();
  } catch (error) {
    console.error('Error fetching orders:', error);
    ordersBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #EF4444;">Error loading orders</td></tr>`;
  }
}

// Render Dashboard
function renderDashboard() {
  // Update Stats
  statTotalOrders.innerText = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
  statRevenue.innerText = `₹${totalRevenue.toLocaleString()}`;
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  statPending.innerText = pendingCount;

  // Update Table
  if (orders.length === 0) {
    ordersBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 3rem;">No orders found</td></tr>`;
    return;
  }

  ordersBody.innerHTML = orders.map(order => `
    <tr>
      <td style="font-weight: 600;">#${order.id.slice(0, 8).toUpperCase()}</td>
      <td>
        <div style="display: flex; flex-direction: column;">
          <span style="font-weight: 500;">Guest</span>
          <span style="font-size: 0.75rem; color: var(--text-muted);">ID: ${order.id.slice(-4)}</span>
        </div>
      </td>
      <td><span class="status-badge" style="background: #F1F5F9; color: #475569; text-transform: capitalize;">${order.order_type.replace('-', ' ')}</span></td>
      <td style="font-weight: 600;">₹${order.total_amount}</td>
      <td>
        <span class="status-badge status-${order.status || 'pending'}">
          ${(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}
        </span>
      </td>
      <td>${new Date(order.created_at).toLocaleDateString()}</td>
      <td>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn" style="padding: 0.4rem; background: #F8FAFC;" onclick="updateStatus('${order.id}', 'confirmed')">
            <i data-lucide="check" size="16" style="color: #10B981;"></i>
          </button>
          <button class="btn" style="padding: 0.4rem; background: #F8FAFC;" onclick="updateStatus('${order.id}', 'cancelled')">
            <i data-lucide="x" size="16" style="color: #EF4444;"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  lucide.createIcons();
}

// Update Order Status
async function updateStatus(id, status) {
  try {
    const { error } = await supabaseClient
      .from('orders')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
    
    // Optimistic update
    orders = orders.map(o => o.id === id ? { ...o, status } : o);
    renderDashboard();
  } catch (error) {
    alert('Error updating status: ' + error.message);
  }
}

// Realtime Updates
function setupRealtime() {
  supabaseClient
    .channel('orders-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
      console.log('Realtime update:', payload);
      fetchOrders(); // Refresh all to keep it simple, or handle specific event
    })
    .subscribe();
}

// Refresh Button
window.refreshOrders = fetchOrders;

// Run
init();
