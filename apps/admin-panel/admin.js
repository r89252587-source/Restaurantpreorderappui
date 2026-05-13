// Supabase Configuration
const SUPABASE_URL = 'https://yczzrgowkbaolkcmudvx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_UiFLTQw38cUsMU6tchu04w_zEHxf6uG';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// State
let orders = [];
let menuItems = [];
let currentView = 'dashboard';

// DOM Elements
const navDashboard = document.getElementById('nav-dashboard');
const navMenu = document.getElementById('nav-menu');
const navSettings = document.getElementById('nav-settings');

const viewDashboard = document.getElementById('view-dashboard');
const viewMenu = document.getElementById('view-menu');
const viewSettings = document.getElementById('view-settings');

const ordersBody = document.getElementById('orders-body');
const menuBody = document.getElementById('menu-body');
const statTotalOrders = document.getElementById('stat-total-orders');
const statRevenue = document.getElementById('stat-revenue');
const statPending = document.getElementById('stat-pending');

// Modal Elements
const menuModal = document.getElementById('menu-modal');
const menuForm = document.getElementById('menu-form');
const modalTitle = document.getElementById('modal-title');

// Initialize
async function init() {
  setupNavigation();
  await fetchOrders();
  await fetchMenu();
  await fetchRestaurantData();
  setupRealtime();
}

// Navigation
function setupNavigation() {
  navDashboard.addEventListener('click', (e) => {
    e.preventDefault();
    switchView('dashboard');
  });
  navMenu.addEventListener('click', (e) => {
    e.preventDefault();
    switchView('menu');
  });
  navSettings.addEventListener('click', (e) => {
    e.preventDefault();
    switchView('settings');
  });
}

function switchView(view) {
  currentView = view;
  
  // Update UI
  viewDashboard.style.display = view === 'dashboard' ? 'block' : 'none';
  viewMenu.style.display = view === 'menu' ? 'block' : 'none';
  viewSettings.style.display = view === 'settings' ? 'block' : 'none';
  
  // Update Nav Links
  navDashboard.classList.toggle('active', view === 'dashboard');
  navMenu.classList.toggle('active', view === 'menu');
  navSettings.classList.toggle('active', view === 'settings');

  // Update Header Title
  const headerMap = {
    'dashboard': 'Dashboard Overview',
    'menu': 'Menu Management',
    'settings': 'Restaurant Settings'
  };
  document.querySelector('.header-title h1').innerText = headerMap[view];
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
    .channel('admin-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
      fetchOrders();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, payload => {
      fetchMenu();
    })
    .subscribe();
}

// --- Menu Management Logic ---

async function fetchMenu() {
  try {
    const { data, error } = await supabaseClient
      .from('menu_items')
      .select('*')
      .order('name');

    if (error) throw error;
    menuItems = data || [];
    renderMenu();
  } catch (error) {
    console.error('Error fetching menu:', error);
  }
}

function renderMenu() {
  if (menuItems.length === 0) {
    menuBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 3rem;">No menu items found</td></tr>`;
    return;
  }

  menuBody.innerHTML = menuItems.map(item => `
    <tr>
      <td>
        <div style="display: flex; align-items: center; gap: 1rem;">
          <img src="${item.image}" style="width: 40px; height: 40px; border-radius: 0.5rem; object-fit: cover;">
          <div style="display: flex; flex-direction: column;">
            <span style="font-weight: 600;">${item.name}</span>
            <span style="font-size: 0.75rem; color: var(--text-muted);">${item.food_type}</span>
          </div>
        </div>
      </td>
      <td><span class="status-badge" style="background: #F1F5F9; color: #475569;">${item.category}</span></td>
      <td style="font-weight: 600;">
        ${item.has_portions ? `H: ₹${item.half_price} / F: ₹${item.full_price}` : `₹${item.price}`}
      </td>
      <td>${item.food_type}</td>
      <td>${item.has_portions ? 'Yes' : 'No'}</td>
      <td>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn" style="padding: 0.4rem; background: #F8FAFC;" onclick="editMenuItem('${item.id}')">
            <i data-lucide="edit-2" size="16" style="color: #6366F1;"></i>
          </button>
          <button class="btn" style="padding: 0.4rem; background: #F8FAFC;" onclick="deleteMenuItem('${item.id}')">
            <i data-lucide="trash-2" size="16" style="color: #EF4444;"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  lucide.createIcons();
}

// Modal Functions
window.openMenuModal = function(item = null) {
  menuForm.reset();
  document.getElementById('item-id').value = '';
  modalTitle.innerText = 'Add Menu Item';
  
  if (item) {
    modalTitle.innerText = 'Edit Menu Item';
    document.getElementById('item-id').value = item.id;
    document.getElementById('item-name').value = item.name;
    document.getElementById('item-description').value = item.description;
    document.getElementById('item-category').value = item.category;
    document.getElementById('item-food-type').value = item.food_type;
    document.getElementById('item-has-portions').checked = item.has_portions;
    document.getElementById('item-price').value = item.price || '';
    document.getElementById('item-half-price').value = item.half_price || '';
    document.getElementById('item-full-price').value = item.full_price || '';
    document.getElementById('item-image').value = item.image;
    togglePortions();
  }
  
  menuModal.style.display = 'flex';
};

window.closeMenuModal = function() {
  menuModal.style.display = 'none';
};

window.togglePortions = function() {
  const hasPortions = document.getElementById('item-has-portions').checked;
  document.getElementById('single-price-group').style.display = hasPortions ? 'none' : 'block';
  document.getElementById('portion-price-group').style.display = hasPortions ? 'grid' : 'none';
};

// Form Submission
menuForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('item-id').value;
  const hasPortions = document.getElementById('item-has-portions').checked;

  // For this demo, we assume we are updating the first restaurant's menu
  // In a real app, you'd select the restaurant first
  const restaurant_id = '11111111-1111-1111-1111-111111111111'; 

  const itemData = {
    restaurant_id,
    name: document.getElementById('item-name').value,
    description: document.getElementById('item-description').value,
    category: document.getElementById('item-category').value,
    food_type: document.getElementById('item-food-type').value,
    has_portions: hasPortions,
    price: hasPortions ? null : parseFloat(document.getElementById('item-price').value),
    half_price: hasPortions ? parseFloat(document.getElementById('item-half-price').value) : null,
    full_price: hasPortions ? parseFloat(document.getElementById('item-full-price').value) : null,
    image: document.getElementById('item-image').value,
    is_countable: true
  };

  try {
    let result;
    if (id) {
      result = await supabaseClient.from('menu_items').update(itemData).eq('id', id);
    } else {
      result = await supabaseClient.from('menu_items').insert(itemData);
    }

    if (result.error) throw result.error;
    
    closeMenuModal();
    fetchMenu();
  } catch (error) {
    alert('Error saving menu item: ' + error.message);
  }
});

window.editMenuItem = function(id) {
  const item = menuItems.find(i => i.id === id);
  if (item) openMenuModal(item);
};

window.deleteMenuItem = async function(id) {
  if (confirm('Are you sure you want to delete this item?')) {
    try {
      const { error } = await supabaseClient.from('menu_items').delete().eq('id', id);
      if (error) throw error;
      fetchMenu();
    } catch (error) {
      alert('Error deleting item: ' + error.message);
    }
  }
};

// --- Restaurant Settings Logic ---

let currentRestaurant = null;
const RESTAURANT_ID = '11111111-1111-1111-1111-111111111111'; // Using Spice Villa as default

async function fetchRestaurantData() {
  try {
    const { data, error } = await supabaseClient
      .from('restaurants')
      .select('*')
      .eq('id', RESTAURANT_ID)
      .single();

    if (error) throw error;
    currentRestaurant = data;
    fillSettingsForm();
  } catch (error) {
    console.error('Error fetching restaurant settings:', error);
  }
}

function fillSettingsForm() {
  if (!currentRestaurant) return;
  
  document.getElementById('res-name').value = currentRestaurant.name;
  document.getElementById('res-cuisine').value = currentRestaurant.cuisine;
  document.getElementById('res-location').value = currentRestaurant.location;
  document.getElementById('res-hours').value = currentRestaurant.opening_hours || '';
  document.getElementById('res-phone').value = currentRestaurant.phone || '';
  document.getElementById('res-prep').value = currentRestaurant.prep_time;
  document.getElementById('res-rating').value = currentRestaurant.rating;
  document.getElementById('res-description').value = currentRestaurant.description || '';
  document.getElementById('res-image').value = currentRestaurant.image;

  const services = currentRestaurant.services || {};
  document.getElementById('res-service-preorder').checked = services.preBooking;
  document.getElementById('res-service-takeaway').checked = services.takeaway;
  document.getElementById('res-service-dinein').checked = services.dineIn;
}

window.saveRestaurantSettings = async function() {
  const settingsData = {
    name: document.getElementById('res-name').value,
    cuisine: document.getElementById('res-cuisine').value,
    location: document.getElementById('res-location').value,
    opening_hours: document.getElementById('res-hours').value,
    phone: document.getElementById('res-phone').value,
    prep_time: document.getElementById('res-prep').value,
    description: document.getElementById('res-description').value,
    image: document.getElementById('res-image').value,
    services: {
      preBooking: document.getElementById('res-service-preorder').checked,
      takeaway: document.getElementById('res-service-takeaway').checked,
      dineIn: document.getElementById('res-service-dinein').checked
    }
  };

  try {
    const { error } = await supabaseClient
      .from('restaurants')
      .update(settingsData)
      .eq('id', RESTAURANT_ID);

    if (error) throw error;
    alert('Settings saved successfully!');
    fetchRestaurantData();
  } catch (error) {
    alert('Error saving settings: ' + error.message);
  }
};

// Refresh Button
window.refreshOrders = fetchOrders;

// Run
init();
