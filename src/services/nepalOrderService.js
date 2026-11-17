import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/config";
import {
  sendNepalOrderConfirmationEmail,
  sendNepalOrderStatusEmail,
} from "./mailService";

const NEPAL_ORDERS_KEY = "daalbhat_mock_nepal_orders";

function getStoredNepalOrders() {
  try {
    const data = localStorage.getItem(NEPAL_ORDERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveStoredNepalOrders(orders) {
  try {
    localStorage.setItem(NEPAL_ORDERS_KEY, JSON.stringify(orders));
  } catch {}
}

/**
 * Creates a new Nepal Custom / Sourcing Order.
 * Saves to Firestore `nepalOrders` collection and triggers automated email confirmation.
 */
export async function createNepalOrder(data) {
  const orderId = `NEP-${Date.now().toString().slice(-6)}`;
  
  const cleanOrder = {
    orderId,
    senderName: data.senderName || data.fullName || "",
    senderEmail: data.senderEmail || data.email || "",
    senderPhone: data.senderPhone || data.phone || "",
    recipientName: data.recipientName || data.fullName || "",
    recipientPhone: data.recipientPhone || data.phone || "",
    recipientAddress: data.recipientAddress || data.fullAddress || data.address || "",
    items: Array.isArray(data.items) ? data.items.filter((i) => i.name && i.name.trim()) : [],
    notes: data.notes || "",
    status: data.status || "pending",
    createdAt: new Date().toISOString(),
  };

  let created = cleanOrder;

  try {
    const docRef = await addDoc(collection(db, "nepalOrders"), cleanOrder);
    created = { id: docRef.id, ...cleanOrder };
  } catch (err) {
    console.warn("[nepalOrderService] Firestore save failed, using local fallback:", err.message);
    const stored = getStoredNepalOrders();
    stored.unshift(cleanOrder);
    saveStoredNepalOrders(stored);
  }

  // Trigger automated email confirmation via existing mail service
  sendNepalOrderConfirmationEmail(created).catch((err) =>
    console.warn("[nepalOrderService] Confirmation email trigger failed:", err.message)
  );

  return created;
}

/**
 * Retrieves all Nepal orders sorted by creation time (descending).
 */
export async function getAllNepalOrders() {
  try {
    const q = query(collection(db, "nepalOrders"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  } catch (err) {
    console.warn("[nepalOrderService] Firestore getAllNepalOrders failed, using fallback:", err.message);
  }

  const stored = getStoredNepalOrders();
  return stored.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Updates status of a Nepal order and triggers an automated status email.
 */
export async function updateNepalOrderStatus(orderIdOrDocId, status, customNotes = "") {
  try {
    const snap = await getDocs(collection(db, "nepalOrders"));
    const targetDoc = snap.docs.find(
      (d) => d.id === orderIdOrDocId || d.data().orderId === orderIdOrDocId
    );

    if (targetDoc) {
      const docRef = doc(db, "nepalOrders", targetDoc.id);
      await updateDoc(docRef, {
        status,
        updatedAt: new Date().toISOString(),
        ...(customNotes ? { adminNotes: customNotes } : {}),
      });

      const updatedOrder = {
        id: targetDoc.id,
        ...targetDoc.data(),
        status,
        ...(customNotes ? { adminNotes: customNotes } : {}),
      };

      // Trigger status update email
      sendNepalOrderStatusEmail(updatedOrder, status, customNotes).catch((err) =>
        console.warn("[nepalOrderService] Status email trigger failed:", err.message)
      );

      return updatedOrder;
    }
  } catch (err) {
    console.warn("[nepalOrderService] Firestore updateNepalOrderStatus failed, using fallback:", err.message);
  }

  const stored = getStoredNepalOrders();
  const order = stored.find(
    (o) => o.id === orderIdOrDocId || o.orderId === orderIdOrDocId
  );
  if (order) {
    order.status = status;
    if (customNotes) order.adminNotes = customNotes;
    order.updatedAt = new Date().toISOString();
    saveStoredNepalOrders(stored);

    sendNepalOrderStatusEmail(order, status, customNotes).catch((err) =>
      console.warn("[nepalOrderService] Status email trigger fallback failed:", err.message)
    );
  }
  return order;
}

/**
 * Deletes a single Nepal order record.
 */
export async function deleteNepalOrder(orderIdOrDocId) {
  try {
    const snap = await getDocs(collection(db, "nepalOrders"));
    const targetDoc = snap.docs.find(
      (d) => d.id === orderIdOrDocId || d.data().orderId === orderIdOrDocId
    );

    if (targetDoc) {
      await deleteDoc(doc(db, "nepalOrders", targetDoc.id));
      return { success: true };
    }
  } catch (err) {
    console.warn("[nepalOrderService] Firestore deleteNepalOrder failed, using fallback:", err.message);
  }

  const stored = getStoredNepalOrders();
  const filtered = stored.filter(
    (o) => o.id !== orderIdOrDocId && o.orderId !== orderIdOrDocId
  );
  saveStoredNepalOrders(filtered);
  return { success: true };
}

/**
 * Batch deletes all Nepal orders.
 */
export async function deleteAllNepalOrders() {
  try {
    const snap = await getDocs(collection(db, "nepalOrders"));
    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      return { success: true };
    }
  } catch (err) {
    console.warn("[nepalOrderService] Firestore deleteAllNepalOrders failed, using fallback:", err.message);
  }

  saveStoredNepalOrders([]);
  return { success: true };
}
