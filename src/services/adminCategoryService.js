import {
  collection,
  doc,
  getDocs,
  addDoc,
  setDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import * as store from "./categoryStore";

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

export async function getAllCategories() {
  try {
    const snap = await getDocs(collection(db, "categories"));
    const items = snap.docs.map((d) => ({
      ...d.data(),
      id: d.id,
      firestoreId: d.id,
    }));
    return items;
  } catch (err) {
    console.error("[adminCategoryService] Firestore query failed:", err.message);
    throw err;
  }
}

export async function createCategory(category) {
  try {
    const cleanCategory = sanitizeForFirestore({
      ...category,
      slug: category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    });
    delete cleanCategory.id;
    delete cleanCategory.firestoreId;

    const docRef = await addDoc(collection(db, "categories"), cleanCategory);
    return { ...cleanCategory, id: docRef.id, firestoreId: docRef.id };
  } catch (err) {
    console.error("[adminCategoryService] Firestore create failed:", err.message);
    throw err;
  }
}

export async function editCategory(id, updates) {
  if (!id) throw new Error("Category ID is required for editing.");
  try {
    const docRef = doc(db, "categories", String(id));
    const cleanUpdates = sanitizeForFirestore(updates);
    delete cleanUpdates.id;
    delete cleanUpdates.firestoreId;

    await setDoc(docRef, cleanUpdates, { merge: true });
    const updated = await getDoc(docRef);
    if (!updated.exists()) {
      throw new Error(`Category ${id} not found.`);
    }
    return { ...updated.data(), id: updated.id, firestoreId: updated.id };
  } catch (err) {
    console.error("[adminCategoryService] Firestore edit failed:", err.message);
    throw err;
  }
}

export async function removeCategory(id) {
  if (!id) throw new Error("Category ID is required for deletion.");
  try {
    await deleteDoc(doc(db, "categories", String(id)));
    store.deleteCategory(id);
    return true;
  } catch (err) {
    console.error("[adminCategoryService] Firestore remove failed:", err.message);
    throw err;
  }
}
