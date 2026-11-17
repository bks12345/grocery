import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/config";

const STORAGE_KEY = "daalbhat_customized_grocery_items";

/**
 * Starter curated staple items configured for family grocery calculations.
 * Links to existing product catalog entries where possible.
 */
export const defaultCustomizedGroceryItems = [
  {
    id: "cg_rice",
    productId: "p001",
    name: "Rice (Everyday Milled)",
    category: "Grains & Cereals",
    unit: "kg",
    perAdult: 2.5,
    price: 90,
    diets: ["all"],
    dietaryTag: "none",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80",
    inStock: true,
    isActive: true,
    notes: "Primary carbohydrate staple",
  },
  {
    id: "cg_atta",
    productId: "p003",
    name: "Wheat Flour (Atta)",
    category: "Grains & Cereals",
    unit: "kg",
    perAdult: 2.0,
    price: 110,
    diets: ["all"],
    dietaryTag: "none",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
    inStock: true,
    isActive: true,
    notes: "Essential for everyday rotis and flatbreads",
  },
  {
    id: "cg_lentils",
    productId: "p005",
    name: "Lentils (Moong / Masoor Dal)",
    category: "Grains & Cereals",
    unit: "kg",
    perAdult: 0.75,
    price: 180,
    diets: ["all"],
    dietaryTag: "none",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
    inStock: true,
    isActive: true,
    notes: "Core protein and daily daal",
  },
  {
    id: "cg_oil",
    productId: "p013",
    name: "Cooking Oil (Mustard / Sunflower)",
    category: "Cooking Essentials",
    unit: "L",
    perAdult: 0.5,
    price: 240,
    diets: ["all"],
    dietaryTag: "oil",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80",
    inStock: true,
    isActive: true,
    notes: "Daily cooking base (Reduced on Low Oil preference)",
  },
  {
    id: "cg_sugar",
    productId: "p015",
    name: "Sugar",
    category: "Cooking Essentials",
    unit: "kg",
    perAdult: 0.5,
    price: 80,
    diets: ["all"],
    dietaryTag: "none",
    image: "https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=600&auto=format&fit=crop&q=80",
    inStock: true,
    isActive: true,
    notes: "Tea and sweetening",
  },
  {
    id: "cg_potato",
    productId: null,
    name: "Potatoes (Fresh Farm)",
    category: "Vegetables",
    unit: "kg",
    perAdult: 1.5,
    price: 50,
    diets: ["all"],
    dietaryTag: "none",
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80",
    inStock: true,
    isActive: true,
    notes: "Versatile staple vegetable",
  },
  {
    id: "cg_onion",
    productId: null,
    name: "Red Onions",
    category: "Vegetables",
    unit: "kg",
    perAdult: 1.0,
    price: 60,
    diets: ["all"],
    dietaryTag: "none",
    image: "https://images.unsplash.com/photo-1508747703725-719777637510?w=600&auto=format&fit=crop&q=80",
    inStock: true,
    isActive: true,
    notes: "Aromatic base for curries and gravies",
  },
  {
    id: "cg_salt",
    productId: "p016",
    name: "Himalayan Pink Salt",
    category: "Cooking Essentials",
    unit: "kg",
    perAdult: 0.25,
    price: 35,
    diets: ["all"],
    dietaryTag: "salt",
    image: "https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=600&auto=format&fit=crop&q=80",
    inStock: true,
    isActive: true,
    notes: "Daily seasoning (Reduced on Low Salt preference)",
  },
  {
    id: "cg_tea",
    productId: "p020",
    name: "Ilam Orthodox Black Tea",
    category: "Beverages",
    unit: "g",
    perAdult: 100,
    price: 0.5,
    diets: ["all"],
    dietaryTag: "none",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80",
    inStock: true,
    isActive: true,
    notes: "Morning and afternoon chiya",
  },
  {
    id: "cg_milkpowder",
    productId: null,
    name: "Dairy Milk Powder",
    category: "Dairy",
    unit: "g",
    perAdult: 150,
    price: 0.65,
    diets: ["all"],
    dietaryTag: "none",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80",
    inStock: true,
    isActive: true,
    notes: "Tea and dessert preparation",
  },
  {
    id: "cg_eggs",
    productId: null,
    name: "Farm Fresh Eggs",
    category: "Protein",
    unit: "pcs",
    perAdult: 10,
    price: 15,
    diets: ["eggetarian", "non-vegetarian"],
    dietaryTag: "none",
    image: "https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=600&auto=format&fit=crop&q=80",
    inStock: true,
    isActive: true,
    notes: "Breakfast and baking protein",
  },
  {
    id: "cg_chicken",
    productId: null,
    name: "Fresh Chicken Curry Cut",
    category: "Protein",
    unit: "kg",
    perAdult: 1.0,
    price: 380,
    diets: ["non-vegetarian"],
    dietaryTag: "none",
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&auto=format&fit=crop&q=80",
    inStock: true,
    isActive: true,
    notes: "Weekly family poultry protein",
  },
  {
    id: "cg_paneer",
    productId: "p010",
    name: "Fresh Malai Paneer",
    category: "Dairy",
    unit: "kg",
    perAdult: 0.4,
    price: 420,
    diets: ["vegetarian", "eggetarian"],
    dietaryTag: "none",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80",
    inStock: true,
    isActive: true,
    notes: "Vegetarian high-protein staple",
  },
  {
    id: "cg_soyachunks",
    productId: "p012",
    name: "Soya Chunks / Meal Maker",
    category: "Protein",
    unit: "kg",
    perAdult: 0.3,
    price: 260,
    diets: ["vegetarian", "vegan"],
    dietaryTag: "none",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80",
    inStock: true,
    isActive: true,
    notes: "Vegan plant protein powerhouse",
  },
  {
    id: "cg_tofu",
    productId: null,
    name: "Silken Organic Tofu",
    category: "Protein",
    unit: "kg",
    perAdult: 0.3,
    price: 300,
    diets: ["vegan"],
    dietaryTag: "none",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
    inStock: true,
    isActive: true,
    notes: "Dairy-free vegan protein",
  },
];

function sanitizeForFirestore(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore).filter((v) => v !== undefined);
  const clean = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) clean[k] = sanitizeForFirestore(v);
  }
  return clean;
}

function getStoredItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn("[customizedGroceryService] Error reading local storage:", err);
  }
  saveStoredItems(defaultCustomizedGroceryItems);
  return defaultCustomizedGroceryItems;
}

function saveStoredItems(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn("[customizedGroceryService] Error writing local storage:", err);
  }
}

/**
 * Get all customized grocery items for the admin panel and calculator.
 */
export async function getCustomizedGroceryItems() {
  try {
    const snap = await getDocs(collection(db, "customizedGrocery"));
    if (!snap.empty) {
      const items = snap.docs.map((d) => ({ ...d.data(), id: d.id, firestoreId: d.id }));
      saveStoredItems(items);
      return items;
    }

    // Read-only defaults if Firestore collection is empty (never auto-seed to Firestore)
    return defaultCustomizedGroceryItems;
  } catch (err) {
    console.warn("[customizedGroceryService] Firestore fetch failed, using fallback:", err.message);
  }

  return getStoredItems();
}

/**
 * Add a single customized grocery item.
 */
export async function addCustomizedGroceryItem(itemData) {
  const id = itemData.id || `cg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const clean = sanitizeForFirestore({
    id,
    productId: itemData.productId || null,
    name: itemData.name || "Unnamed Item",
    category: itemData.category || "General",
    unit: itemData.unit || "kg",
    perAdult: Number(itemData.perAdult) || 1.0,
    price: Number(itemData.price) || 0,
    diets: Array.isArray(itemData.diets) && itemData.diets.length > 0 ? itemData.diets : ["all"],
    dietaryTag: itemData.dietaryTag || "none",
    image: itemData.image || "",
    inStock: itemData.inStock !== false,
    isActive: itemData.isActive !== false,
    notes: itemData.notes || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  try {
    await setDoc(doc(db, "customizedGrocery", id), clean);
  } catch (err) {
    console.warn("[customizedGroceryService] Firestore add failed, writing locally:", err.message);
  }

  const current = getStoredItems();
  const next = [clean, ...current.filter((i) => i.id !== id)];
  saveStoredItems(next);
  return clean;
}

/**
 * Batch insert multiple store products into Customized Grocery.
 */
export async function insertProductsFromCatalog(productsToInsert = []) {
  if (!productsToInsert.length) return [];

  const createdItems = [];
  const current = getStoredItems();

  try {
    const batch = writeBatch(db);
    for (const p of productsToInsert) {
      const id = `cg_${p.id || Date.now()}`;
      const item = sanitizeForFirestore({
        id,
        productId: p.id,
        name: p.customName || p.name,
        category: p.customCategory || p.categoryName || (typeof p.category === "string" ? p.category : "Grains & Cereals"),
        unit: p.customUnit || (p.weight?.toLowerCase().includes("kg") ? "kg" : p.weight?.toLowerCase().includes("l") ? "L" : "pack"),
        perAdult: Number(p.customPerAdult) || 1.0,
        price: Number(p.customPrice ?? p.price ?? 0),
        diets: Array.isArray(p.customDiets) && p.customDiets.length > 0 ? p.customDiets : ["all"],
        dietaryTag: p.customDietaryTag || "none",
        image: p.image || (Array.isArray(p.images) ? p.images[0] : "") || "",
        inStock: p.inStock !== false,
        isActive: true,
        notes: p.description || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      batch.set(doc(db, "customizedGrocery", id), item);
      createdItems.push(item);
    }
    await batch.commit();
  } catch (err) {
    console.warn("[customizedGroceryService] Batch insert failed in Firestore, updating locally:", err.message);
  }

  const newIds = new Set(createdItems.map((i) => i.id));
  const merged = [...createdItems, ...current.filter((i) => !newIds.has(i.id))];
  saveStoredItems(merged);
  return createdItems;
}

/**
 * Update an existing customized grocery item.
 */
export async function updateCustomizedGroceryItem(id, updates) {
  const clean = sanitizeForFirestore({
    ...updates,
    updatedAt: new Date().toISOString(),
  });

  try {
    await updateDoc(doc(db, "customizedGrocery", id), clean);
  } catch (err) {
    console.warn("[customizedGroceryService] Firestore update failed, writing locally:", err.message);
  }

  const current = getStoredItems();
  const next = current.map((i) => (i.id === id ? { ...i, ...clean } : i));
  saveStoredItems(next);
  return next.find((i) => i.id === id);
}

/**
 * Quick toggle active status for an item.
 */
export async function toggleCustomizedGroceryItem(id, isActive) {
  return updateCustomizedGroceryItem(id, { isActive });
}

/**
 * Delete an item from customized grocery.
 */
export async function deleteCustomizedGroceryItem(id) {
  try {
    await deleteDoc(doc(db, "customizedGrocery", id));
  } catch (err) {
    console.warn("[customizedGroceryService] Firestore delete failed, updating locally:", err.message);
  }

  const current = getStoredItems();
  const next = current.filter((i) => i.id !== id);
  saveStoredItems(next);
  return true;
}

/**
 * Reset all customized grocery items to default starter catalog.
 */
export async function resetCustomizedGroceryToDefaults() {
  try {
    const snap = await getDocs(collection(db, "customizedGrocery"));
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    defaultCustomizedGroceryItems.forEach((item) => {
      const ref = doc(db, "customizedGrocery", item.id);
      batch.set(ref, sanitizeForFirestore(item));
    });
    await batch.commit();
  } catch (err) {
    console.warn("[customizedGroceryService] Firestore reset failed, writing locally:", err.message);
  }

  saveStoredItems(defaultCustomizedGroceryItems);
  return defaultCustomizedGroceryItems;
}
