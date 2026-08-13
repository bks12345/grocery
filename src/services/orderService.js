import { apiGet, apiPost, apiPatch, apiDelete } from './apiClient';

const ORDERS_KEY = 'daalbhat_mock_orders';

function getStoredOrders() {
  try {
    const data = localStorage.getItem(ORDERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveStoredOrders(orders) {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch {}
}

export async function placeOrder(orderData, userId = null) {
  try {
    const res = await apiPost('/api/orders', { ...orderData, userId });
    if (res) return res;
  } catch (err) {
    console.warn('[orderService] Place order API failed, using fallback:', err.message);
  }

  const orderId = `ORD-${Date.now().toString().slice(-6)}`;
  const newOrder = {
    orderId,
    userId,
    placedAt: new Date().toISOString(),
    status: 'confirmed',
    ...orderData,
  };

  const orders = getStoredOrders();
  orders.unshift(newOrder);
  saveStoredOrders(orders);

  return newOrder;
}

export async function getOrderHistory(userId) {
  try {
    const res = await apiGet('/api/orders');
    if (res) return res;
  } catch (err) {
    console.warn('[orderService] Get orders API failed, using fallback:', err.message);
  }

  const orders = getStoredOrders();
  if (userId) {
    return orders.filter((o) => o.userId === userId);
  }
  return orders;
}

export async function getOrder(orderId) {
  try {
    const res = await apiGet(`/api/orders/${orderId}`);
    if (res) return res;
  } catch (err) {
    console.warn('[orderService] Get order API failed, using fallback:', err.message);
  }

  const orders = getStoredOrders();
  return orders.find((o) => o.orderId === orderId) || null;
}

// ---- Admin: order management ----
export async function getAllOrders() {
  try {
    const res = await apiGet('/api/admin/orders');
    if (res) return res;
  } catch (err) {
    console.warn('[orderService] Admin orders API failed, using fallback:', err.message);
  }
  return getStoredOrders();
}

export async function updateOrderStatus(orderId, status) {
  try {
    const res = await apiPatch(`/api/admin/orders/${orderId}/status`, { status });
    if (res) return res;
  } catch (err) {
    console.warn('[orderService] Update order status API failed, using fallback:', err.message);
  }

  const orders = getStoredOrders();
  const order = orders.find((o) => o.orderId === orderId);
  if (order) {
    order.status = status;
    saveStoredOrders(orders);
  }
  return order;
}

export async function deleteOrder(orderId) {
  try {
    const res = await apiDelete(`/api/admin/orders/${orderId}`);
    if (res) return res;
  } catch (err) {
    console.warn('[orderService] Delete order API failed, using fallback:', err.message);
  }

  const orders = getStoredOrders();
  const newOrders = orders.filter((o) => o.orderId !== orderId);
  saveStoredOrders(newOrders);
  return { success: true };
}

export async function deleteAllOrders() {
  try {
    const res = await apiDelete('/api/admin/orders');
    if (res) return res;
  } catch (err) {
    console.warn('[orderService] Delete all orders API failed, using fallback:', err.message);
  }

  saveStoredOrders([]);
  return { success: true };
}
