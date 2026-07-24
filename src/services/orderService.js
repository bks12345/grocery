// Mimics real order endpoints (POST /api/orders, GET /api/orders).
// Orders are saved to localStorage so Order History has something to show
// across a refresh. Swap the body of each function for real apiPost/apiGet
// calls later — callers already treat everything here as async.

const ORDERS_KEY = "daalbhat_orders";
const delay = (ms = 700) => new Promise((r) => setTimeout(r, ms));

function loadOrders() {
  try {
    const saved = localStorage.getItem(ORDERS_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch {
    // Storage unavailable — order still succeeds, just won't show in history
  }
}

/**
 * @param {object} orderData - { items, address, deliveryMethod, paymentMethod, subtotal, deliveryFee, total }
 * @param {string|null} userId - null for guest checkout
 * @returns {Promise<{orderId: string, estimatedDelivery: string}>}
 */
export async function placeOrder(orderData, userId = null) {
  await delay();

  if (!orderData.items?.length) {
    throw new Error("Cannot place an order with an empty cart");
  }

  // A real backend would generate this; we fake a readable order id.
  const orderId = `GC${Date.now().toString().slice(-8)}`;

  const deliveryDays = orderData.deliveryMethod === "express" ? 1 : 3;
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + deliveryDays);
  const estimatedDelivery = estimatedDate.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const order = {
    orderId,
    userId,
    placedAt: new Date().toISOString(),
    estimatedDelivery,
    status: "confirmed",
    items: orderData.items.map(({ product, quantity }) => ({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
    })),
    address: orderData.address,
    deliveryMethod: orderData.deliveryMethod,
    paymentMethod: orderData.paymentMethod,
    subtotal: orderData.subtotal,
    deliveryFee: orderData.deliveryFee,
    total: orderData.total,
  };

  saveOrders([order, ...loadOrders()]);

  return { orderId, estimatedDelivery };
}

/** GET /api/orders — order history for the logged-in user */
export async function getOrderHistory(userId) {
  await delay(300);
  return loadOrders().filter((o) => o.userId === userId);
}

/** GET /api/orders/:orderId */
export async function getOrder(orderId) {
  await delay(200);
  const order = loadOrders().find((o) => o.orderId === orderId);
  if (!order) throw new Error("Order not found.");
  return order;
}

// ---- Admin: order management ----

/** GET /api/admin/orders — every order, across all customers */
export async function getAllOrders() {
  await delay(300);
  return loadOrders();
}

/** PATCH /api/admin/orders/:orderId/status */
export async function updateOrderStatus(orderId, status) {
  await delay();
  const orders = loadOrders();
  const index = orders.findIndex((o) => o.orderId === orderId);
  if (index === -1) throw new Error("Order not found.");
  orders[index] = { ...orders[index], status };
  saveOrders(orders);
  return orders[index];
}
