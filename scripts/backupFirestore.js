import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(rootDir, ".env") });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.projectId) {
  console.error("❌ Error: Missing VITE_FIREBASE_PROJECT_ID in .env.");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const PUBLIC_COLLECTIONS = [
  "products",
  "categories",
  "coupons",
  "goatParts",
  "customizedGrocery",
  "deliveryZones",
  "settings",
  "content",
];

const ADMIN_COLLECTIONS = [
  "orders",
  "nepalOrders",
  "users",
  "contactMessages",
  "emailTemplates",
  "mail",
];

async function authenticateIfPossible() {
  const email = process.env.ADMIN_EMAIL || process.env.SEED_ADMIN_EMAIL || "admin@daalbhat.com";
  const password = process.env.ADMIN_PASSWORD || process.env.SEED_ADMIN_PASSWORD;

  if (email && password) {
    try {
      console.log(`🔐 Attempting administrator authentication (${email})...`);
      await signInWithEmailAndPassword(auth, email, password);
      console.log("✓ Signed in as administrator. Protected collections will be backed up.");
      return true;
    } catch (err) {
      console.warn(`⚠️ Admin auth skipped (${err.message}). Only public collections will be backed up.`);
      return false;
    }
  } else {
    console.log("ℹ️ No ADMIN_PASSWORD provided in .env. Backing up public collections.");
    return false;
  }
}

async function backup() {
  console.log(`\n======================================================`);
  console.log(`📦 Firestore Database Backup Tool`);
  console.log(`Target Project: ${firebaseConfig.projectId}`);
  console.log(`======================================================\n`);

  const isAdmin = await authenticateIfPossible();
  const collectionsToBackup = isAdmin
    ? [...PUBLIC_COLLECTIONS, ...ADMIN_COLLECTIONS]
    : PUBLIC_COLLECTIONS;

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(rootDir, "backups", `firestore-backup-${timestamp}`);
  fs.mkdirSync(backupDir, { recursive: true });

  const completeDatabase = {
    meta: {
      projectId: firebaseConfig.projectId,
      timestamp: new Date().toISOString(),
      isAdminBackup: isAdmin,
    },
    collections: {},
  };

  const summary = [];

  for (const colName of collectionsToBackup) {
    try {
      process.stdout.write(`Fetching '${colName}'... `);
      const snap = await getDocs(collection(db, colName));
      const items = snap.docs.map((docSnap) => ({
        _id: docSnap.id,
        ...docSnap.data(),
      }));

      // Write individual collection file
      const filePath = path.join(backupDir, `${colName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(items, null, 2), "utf8");

      completeDatabase.collections[colName] = items;
      summary.push({
        Collection: colName,
        Count: items.length,
        Size: `${(fs.statSync(filePath).size / 1024).toFixed(2)} KB`,
        Status: "✓ Success",
      });
      console.log(`✓ (${items.length} docs)`);
    } catch (err) {
      console.log(`❌ Failed: ${err.message}`);
      summary.push({
        Collection: colName,
        Count: 0,
        Size: "0 KB",
        Status: `Skipped (${err.code || "Permission/Network"})`,
      });
    }
  }

  // Write aggregate full database dump
  const fullDumpPath = path.join(backupDir, "database-complete-backup.json");
  fs.writeFileSync(fullDumpPath, JSON.stringify(completeDatabase, null, 2), "utf8");

  // Also maintain a 'latest' pointer copy for products
  const latestProductsPath = path.join(rootDir, "backups", "latest-products-backup.json");
  if (completeDatabase.collections.products) {
    fs.writeFileSync(
      latestProductsPath,
      JSON.stringify(completeDatabase.collections.products, null, 2),
      "utf8"
    );
  }

  console.log(`\n======================================================`);
  console.log(`🎉 Backup Completed Successfully!`);
  console.log(`📁 Backup Directory: ${path.relative(rootDir, backupDir)}`);
  console.log(`📄 Latest Products: ${path.relative(rootDir, latestProductsPath)}`);
  console.log(`======================================================\n`);
  console.table(summary);
}

backup().catch((err) => {
  console.error("❌ Fatal Backup Error:", err);
  process.exit(1);
});
