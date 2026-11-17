import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import dotenv from "dotenv";
import { categories } from "../src/data/categories.js";
import { products } from "../src/data/products.js";
import { deliveryZones } from "../src/data/deliveryZones.js";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.projectId) {
  console.error("Error: Please set VITE_FIREBASE_PROJECT_ID in your .env before seeding.");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@daalbhat.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  console.error("❌ Security Error: SEED_ADMIN_PASSWORD environment variable must be explicitly provided.");
  console.error("Please export SEED_ADMIN_PASSWORD with a strong password before running this script.");
  process.exit(1);
}

if (ADMIN_PASSWORD === "admin123" || ADMIN_PASSWORD.length < 8) {
  console.error("❌ Security Error: SEED_ADMIN_PASSWORD cannot be the default 'admin123' and must be at least 8 characters long.");
  process.exit(1);
}

async function authenticateAdmin() {
  console.log(`Authenticating admin (${ADMIN_EMAIL})...`);
  let userCredential;
  try {
    userCredential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log("✓ Signed in as existing admin user.");
  } catch (err) {
    if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
      try {
        userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
        console.log("✓ Created new admin user account.");
      } catch (createErr) {
        if (createErr.code === "auth/email-already-in-use") {
          userCredential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
        } else {
          throw createErr;
        }
      }
    } else {
      throw err;
    }
  }

  const fbUser = userCredential.user;

  // Set user role to admin in Firestore
  await setDoc(doc(db, "users", fbUser.uid), {
    id: fbUser.uid,
    name: "Admin",
    email: ADMIN_EMAIL,
    phone: "9800000000",
    role: "admin",
    blocked: false,
    createdAt: new Date().toISOString(),
    addresses: [],
  });
  console.log(`✓ Admin profile registered in Firestore (UID: ${fbUser.uid})`);
}

async function seed() {
  console.log(`Starting Firestore seeding for project: ${firebaseConfig.projectId}...`);

  // 0. Authenticate as Admin to grant security permissions
  await authenticateAdmin();

  // 1. Seed Categories
  console.log("\n--- Seeding Categories ---");
  for (const cat of categories) {
    const catId = cat.id || cat.slug;
    await setDoc(doc(db, "categories", catId), {
      id: catId,
      name: cat.name,
      slug: cat.slug || cat.id,
      image: cat.image || "",
      color: cat.color || "bg-basil-100",
      subcategories: cat.subcategories || [],
      createdAt: new Date().toISOString(),
    });
    console.log(`✓ Added Category: ${cat.name} (${catId})`);
  }

  // 2. Seed Products
  console.log("\n--- Seeding Products ---");
  for (const prod of products) {
    const prodId = prod.id;
    await setDoc(doc(db, "products", String(prodId)), {
      ...prod,
      id: String(prodId),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log(`✓ Added Product: ${prod.name} ($${prod.price})`);
  }

  // 3. Seed Default Coupons
  console.log("\n--- Seeding Coupons ---");
  const defaultCoupons = [
    { code: "WELCOME10", type: "percent", value: 10, description: "10% off your first order", active: true },
    { code: "FREESHIP", type: "flat", value: 5, description: "Free standard delivery", active: true },
    { code: "DAALBHAT20", type: "percent", value: 20, description: "20% off festival discount", active: true },
  ];

  for (const coupon of defaultCoupons) {
    await setDoc(doc(db, "coupons", coupon.code), {
      ...coupon,
      createdAt: new Date().toISOString(),
    });
    console.log(`✓ Added Coupon: ${coupon.code}`);
  }

  // 4. Seed Email Templates
  console.log("\n--- Seeding Email Templates ---");
  const emailTemplates = [
    {
      type: "otp",
      subject: "Daalbhat: Your Password Reset Link / OTP",
      bodyHtml: "<p>Hello, please use this link or code to reset your password: <strong>{{otp}}</strong></p>",
    },
    {
      type: "order_confirmation",
      subject: "Order Confirmed - #{{orderId}}",
      bodyHtml: "<p>Thank you for your order! Your order #{{orderId}} has been received.</p>",
    },
    {
      type: "order_status",
      subject: "Order Status Updated - #{{orderId}}",
      bodyHtml: "<p>Your order #{{orderId}} status has been updated to: <strong>{{status}}</strong>.</p>",
    },
  ];

  for (const template of emailTemplates) {
    await setDoc(doc(db, "emailTemplates", template.type), {
      ...template,
      updatedAt: new Date().toISOString(),
    });
    console.log(`✓ Added Email Template: ${template.type}`);
  }

  // 5. Seed Delivery Zones
  console.log("\n--- Seeding Delivery Zones ---");
  for (const zone of deliveryZones) {
    const zoneId = zone.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    await setDoc(doc(db, "deliveryZones", zoneId), {
      ...zone,
      id: zoneId,
      updatedAt: new Date().toISOString(),
    });
    console.log(`✓ Added Delivery Zone: ${zone.name} (${zone.postcodes.length} postcodes)`);
  }

  console.log("\n🎉 Firestore seeding complete!");
  console.log(`🔑 Admin credentials: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
