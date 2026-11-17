import {
  collection,
  doc,
  getDocs,
  addDoc,
  setDoc,
  deleteDoc,
  getDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/config";
import * as store from "./productStore";
import {
  uploadImageToStorage,
  uploadMultipleImagesToStorage,
} from "./storageService";

/**
 * Removes undefined fields recursively so Firestore never rejects payloads.
 */
function sanitizeForFirestore(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore).filter((v) => v !== undefined);
  }
  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = sanitizeForFirestore(value);
    }
  }
  return clean;
}

export async function getAllProducts() {
  try {
    const snap = await getDocs(collection(db, "products"));
    const items = snap.docs.map((d) => ({
      ...d.data(),
      id: d.id,
      firestoreId: d.id,
    }));
    // Sort in memory so documents without createdAt are never omitted by Firestore queries
    items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return items;
  } catch (err) {
    console.error("[adminProductService] Firestore query failed:", err.message);
    throw err;
  }
}

export async function createProduct(product) {
  try {
    const cleanProduct = sanitizeForFirestore({
      ...product,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    // Remove client-supplied ID so Firestore document ID is strictly authoritative
    delete cleanProduct.id;
    delete cleanProduct.firestoreId;

    const docRef = await addDoc(collection(db, "products"), cleanProduct);
    return { ...cleanProduct, id: docRef.id, firestoreId: docRef.id };
  } catch (err) {
    console.error("[adminProductService] Firestore create failed:", err.message);
    throw err;
  }
}

export async function editProduct(id, updates) {
  if (!id) throw new Error("Missing product ID to edit");
  try {
    const docRef = doc(db, "products", String(id));
    const cleanUpdates = sanitizeForFirestore({
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    delete cleanUpdates.id;
    delete cleanUpdates.firestoreId;

    await setDoc(docRef, cleanUpdates, { merge: true });
    const updatedDoc = await getDoc(docRef);
    if (!updatedDoc.exists()) {
      throw new Error(`Product ${id} does not exist in database.`);
    }
    return { ...updatedDoc.data(), id: updatedDoc.id, firestoreId: updatedDoc.id };
  } catch (err) {
    console.error("[adminProductService] Firestore edit failed:", err.message);
    throw err;
  }
}

export async function removeProduct(id) {
  if (!id) throw new Error("Missing product ID to remove");
  try {
    await deleteDoc(doc(db, "products", String(id)));
    store.deleteProduct(id);
    return true;
  } catch (err) {
    console.error("[adminProductService] Firestore remove failed:", err.message);
    throw err;
  }
}

/**
 * Product Image Upload & WebP Optimization
 * Uploads an image to Firebase Cloud Storage under 'products' with client-side WebP compression.
 */
export async function uploadProductImage(file) {
  return uploadImageToStorage(file, "products", {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.85,
    allowFallback: true,
  });
}

/**
 * Multiple Product Image Upload
 * Compresses and uploads an array or FileList of product images directly to Firebase Cloud Storage.
 */
export async function uploadMultipleProductImages(files) {
  return uploadMultipleImagesToStorage(files, "products", {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.85,
    allowFallback: true,
  });
}

