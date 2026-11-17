import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, writeBatch, doc } from "firebase/firestore";
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

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.SEED_ADMIN_EMAIL || "admin@daalbhat.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.SEED_ADMIN_PASSWORD;

async function authenticateAdmin() {
  if (!ADMIN_PASSWORD) {
    console.error("❌ Security Error: Administrator password required to delete products.");
    console.error("Please export ADMIN_PASSWORD or SEED_ADMIN_PASSWORD before running this script.");
    process.exit(1);
  }

  console.log(`🔐 Authenticating administrator (${ADMIN_EMAIL})...`);
  try {
    await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log("✓ Administrator authenticated successfully.");
  } catch (err) {
    console.error("❌ Authentication failed:", err.message);
    process.exit(1);
  }
}

async function cleanProducts() {
  console.log(`\n======================================================`);
  console.log(`🧹 Firestore Products Collection Cleaner`);
  console.log(`Target Project: ${firebaseConfig.projectId}`);
  console.log(`Collection: 'products'`);
  console.log(`======================================================\n`);

  const hasConfirmFlag = process.argv.includes("--confirm");
  if (!hasConfirmFlag) {
    console.error("⚠️ SAFETY GUARD: You must run this command with the '--confirm' flag to proceed.");
    console.error("Example: node scripts/cleanProducts.js --confirm\n");
    process.exit(1);
  }

  // Check if a backup exists
  const backupsDir = path.join(rootDir, "backups");
  if (!fs.existsSync(backupsDir) || fs.readdirSync(backupsDir).length === 0) {
    console.warn("⚠️ WARNING: No local backup directory found in 'backups/'.");
    console.warn("We strongly recommend running 'npm run db:backup' before wiping products.\n");
  }

  await authenticateAdmin();

  console.log("🔍 Scanning 'products' collection...");
  const snap = await getDocs(collection(db, "products"));

  if (snap.empty) {
    console.log("ℹ️ The 'products' collection is already empty. Nothing to delete.");
    return;
  }

  const totalCount = snap.size;
  console.log(`Found ${totalCount} product document(s) to delete.\n`);

  // Firestore writeBatch max limit is 500 operations per batch
  const BATCH_SIZE = 450;
  let batch = writeBatch(db);
  let batchCounter = 0;
  let totalDeleted = 0;

  for (const docSnap of snap.docs) {
    batch.delete(doc(db, "products", docSnap.id));
    batchCounter++;
    totalDeleted++;

    if (batchCounter >= BATCH_SIZE) {
      process.stdout.write(`Committing batch deletion (${totalDeleted}/${totalCount})... `);
      await batch.commit();
      console.log("✓ Done");
      batch = writeBatch(db);
      batchCounter = 0;
    }
  }

  if (batchCounter > 0) {
    process.stdout.write(`Committing final batch deletion (${totalDeleted}/${totalCount})... `);
    await batch.commit();
    console.log("✓ Done");
  }

  console.log(`\n======================================================`);
  console.log(`✨ Successfully deleted all ${totalDeleted} product(s) from 'products' collection.`);
  console.log(`Firestore is now ready for fresh product uploads!`);
  console.log(`======================================================\n`);
}

cleanProducts().catch((err) => {
  console.error("❌ Fatal Error during product cleanup:", err);
  process.exit(1);
});
