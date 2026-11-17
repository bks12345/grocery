import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { getProductById } from "./productService";
import { sendOrderConfirmationEmail } from "./mailService";

const ORDERS_KEY = "daalbhat_mock_orders";

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
  const orderId = `ORD-${Date.now().toString().slice(-6)}`;
  
  // Authoritative catalog price verification to prevent client-side cart tampering
  const cleanItems = await Promise.all(
    (orderData.items || []).map(async (i) => {
      const pid = i.productId || i.product?.id || i.id || "";
      let price = Number(i.price ?? i.product?.price ?? 0);
      let name = i.name || i.product?.name || "Product";
      let image = i.image || i.product?.image || "";

      if (pid) {
        try {
          const catalogProduct = await getProductById(pid);
          if (catalogProduct && typeof catalogProduct.price === "number") {
            price = catalogProduct.price;
            name = catalogProduct.name || name;
            image = catalogProduct.image || image;
          }
        } catch {
          // If offline or fallback, retain price
        }
      }

      return {
        productId: pid,
        name,
        price,
        quantity: Math.max(1, Math.min(100, Math.floor(Number(i.quantity || 1)))),
        image,
      };
    })
  );

  const calculatedSubtotal = cleanItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = Number(orderData.deliveryFee || 0);
  const discount = Math.min(calculatedSubtotal, Number(orderData.discount || 0));
  const calculatedTotal = Math.max(0, calculatedSubtotal - discount + deliveryFee);

  const cleanOrder = {
    orderId,
    userId: userId || null,
    placedAt: new Date().toISOString(),
    status: orderData.status || "confirmed",
    estimatedDelivery:
      orderData.estimatedDelivery ||
      (orderData.deliveryMethod === "express"
        ? "Tomorrow, 4pm – 9pm"
        : "2-3 business days"),
    items: cleanItems,
    address: orderData.address || {},
    deliveryMethod: orderData.deliveryMethod || "standard",
    paymentMethod: orderData.paymentMethod || "cod",
    subtotal: calculatedSubtotal,
    deliveryFee,
    discount,
    couponCode: orderData.couponCode || null,
    total: calculatedTotal,
  };

  let placed = cleanOrder;
  try {
    const docRef = await addDoc(collection(db, "orders"), cleanOrder);
    placed = { id: docRef.id, ...cleanOrder };
  } catch (err) {
    console.warn("[orderService] Firestore placeOrder failed, using fallback:", err.message);
    const orders = getStoredOrders();
    orders.unshift(cleanOrder);
    saveStoredOrders(orders);
  }

  // Trigger order confirmation email notification
  sendOrderConfirmationEmail(placed).catch((e) =>
    console.warn("[orderService] Order confirmation email error:", e.message)
  );

  return placed;
}

export async function getOrderHistory(userId) {
  try {
    let q;
    if (userId) {
      q = query(
        collection(db, "orders"),
        where("userId", "==", userId)
      );
    } else {
      q = query(collection(db, "orders"), orderBy("placedAt", "desc"));
    }
    const snap = await getDocs(q);
    if (!snap.empty) {
      const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return orders.sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));
    }
  } catch (err) {
    console.warn("[orderService] Firestore getOrderHistory failed, using fallback:", err.message);
  }

  const orders = getStoredOrders();
  if (userId) {
    return orders.filter((o) => o.userId === userId);
  }
  return orders;
}

export async function getOrder(orderId) {
  try {
    const q = query(collection(db, "orders"), where("orderId", "==", orderId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const d = snap.docs[0];
      return { id: d.id, ...d.data() };
    }
  } catch (err) {
    console.warn("[orderService] Firestore getOrder failed, using fallback:", err.message);
  }

  const orders = getStoredOrders();
  return orders.find((o) => o.orderId === orderId) || null;
}

// ---- Admin: order management ----
export async function getAllOrders() {
  try {
    const snap = await getDocs(query(collection(db, "orders"), orderBy("placedAt", "desc")));
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  } catch (err) {
    console.warn("[orderService] Firestore getAllOrders failed, using fallback:", err.message);
  }
  return getStoredOrders();
}

export async function updateOrderStatus(orderId, status) {
  try {
    const q = query(collection(db, "orders"), where("orderId", "==", orderId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docRef = doc(db, "orders", snap.docs[0].id);
      await updateDoc(docRef, { status, updatedAt: new Date().toISOString() });
      return { id: docRef.id, ...snap.docs[0].data(), status };
    }
  } catch (err) {
    console.warn("[orderService] Firestore updateOrderStatus failed, using fallback:", err.message);
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
    const q = query(collection(db, "orders"), where("orderId", "==", orderId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      await deleteDoc(doc(db, "orders", snap.docs[0].id));
      return { success: true };
    }
  } catch (err) {
    console.warn("[orderService] Firestore deleteOrder failed, using fallback:", err.message);
  }

  const orders = getStoredOrders();
  const newOrders = orders.filter((o) => o.orderId !== orderId);
  saveStoredOrders(newOrders);
  return { success: true };
}

export async function deleteAllOrders() {
  try {
    const snap = await getDocs(collection(db, "orders"));
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    return { success: true };
  } catch (err) {
    console.warn("[orderService] Firestore deleteAllOrders failed, using fallback:", err.message);
  }

  saveStoredOrders([]);
  return { success: true };
}
