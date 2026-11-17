import { collection, doc, getDocs, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const defaultTemplates = [
  {
    id: "otp",
    type: "otp",
    subject: "Daalbhat: Your Password Reset Link / OTP",
    bodyHtml: "<p>Hello, please use this link or code to reset your password: <strong>{{otp}}</strong></p>",
  },
  {
    id: "order_confirmation",
    type: "order_confirmation",
    subject: "Order Confirmed - #{{orderId}}",
    bodyHtml: "<p>Thank you for your order! Your order #{{orderId}} for {{total}} has been received.</p>",
  },
  {
    id: "admin_new_order",
    type: "admin_new_order",
    subject: "New Store Order - #{{orderId}}",
    bodyHtml: "<p>A new order #{{orderId}} of {{total}} has been placed via {{deliveryMethod}}.</p>",
  },
  {
    id: "order_status",
    type: "order_status",
    subject: "Order Status Updated - #{{orderId}}",
    bodyHtml: "<p>Hello {{customerName}}, your order #{{orderId}} is now <strong>{{status}}</strong>.</p>",
  },
  {
    id: "nepal_order_confirmation",
    type: "nepal_order_confirmation",
    subject: "🇳🇵 Order from Nepal Received - #{{orderId}}",
    bodyHtml: "<p>Namaste {{customerName}}, we have received your custom Nepal order request with {{itemsCount}} item(s). Our team will contact you shortly.</p>",
  },
  {
    id: "nepal_order_status",
    type: "nepal_order_status",
    subject: "🇳🇵 Nepal Order Status Update: {{status}} - #{{orderId}}",
    bodyHtml: "<p>Hello {{customerName}}, your Nepal order #{{orderId}} status has been updated to <strong>{{status}}</strong>.</p>",
  },
];

const defaultSenderSettings = {
  senderEmail: "orders@daalbhat.com",
  senderName: "Daalbhat Store",
  replyTo: "support@daalbhat.com",
  emailjsServiceId: "",
  emailjsTemplateId: "",
  emailjsPublicKey: "",
};

const TEMPLATES_KEY = "daalbhat_mock_email_templates";
const SENDER_KEY = "daalbhat_email_sender_settings";

function getStoredTemplates() {
  try {
    const data = localStorage.getItem(TEMPLATES_KEY);
    return data ? JSON.parse(data) : defaultTemplates;
  } catch {
    return defaultTemplates;
  }
}

function saveStoredTemplates(templates) {
  try {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  } catch {}
}

export async function getAllTemplates() {
  try {
    const snap = await getDocs(collection(db, "emailTemplates"));
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, type: d.id, ...d.data() }));
    }
  } catch (err) {
    console.warn("[adminTemplateService] Firestore getTemplates failed, using fallback:", err.message);
  }
  return getStoredTemplates();
}

export async function getTemplate(type) {
  try {
    const docSnap = await getDoc(doc(db, "emailTemplates", type));
    if (docSnap.exists()) {
      return { id: docSnap.id, type: docSnap.id, ...docSnap.data() };
    }
  } catch (err) {
    console.warn("[adminTemplateService] Firestore getTemplate failed:", err.message);
  }
  const templates = getStoredTemplates();
  return templates.find((t) => t.type === type) || null;
}

export async function updateTemplate(type, data) {
  try {
    const docRef = doc(db, "emailTemplates", type);
    await setDoc(docRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
    const updated = await getDoc(docRef);
    return { id: updated.id, type: updated.id, ...updated.data() };
  } catch (err) {
    console.warn("[adminTemplateService] Firestore updateTemplate failed, using fallback:", err.message);
  }

  const templates = getStoredTemplates();
  const index = templates.findIndex((t) => t.type === type);
  if (index !== -1) {
    templates[index] = { ...templates[index], ...data };
    saveStoredTemplates(templates);
    return templates[index];
  }
  return { id: type, type, ...data };
}

export async function getEmailSenderSettings() {
  try {
    const docSnap = await getDoc(doc(db, "settings", "emailConfig"));
    if (docSnap.exists()) {
      return { ...defaultSenderSettings, ...docSnap.data() };
    }
  } catch (err) {
    console.warn("[adminTemplateService] Firestore getEmailSenderSettings failed, using fallback:", err.message);
  }

  try {
    const saved = localStorage.getItem(SENDER_KEY);
    return saved ? { ...defaultSenderSettings, ...JSON.parse(saved) } : defaultSenderSettings;
  } catch {
    return defaultSenderSettings;
  }
}

export async function updateEmailSenderSettings(settings) {
  try {
    const docRef = doc(db, "settings", "emailConfig");
    await setDoc(docRef, { ...settings, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn("[adminTemplateService] Firestore updateEmailSenderSettings failed, using fallback:", err.message);
  }

  try {
    localStorage.setItem(SENDER_KEY, JSON.stringify(settings));
  } catch {}

  return settings;
}
