import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { getCategoryImage, getCategoryImageFallback } from "../data/images";

export const DEFAULT_CONTENT = {
  hero: {
    slides: [
      {
        eyebrow: "Fresh picks, every morning",
        title: "Pantry staples that feel straight from the source.",
        subtitle:
          "Shop grains, flours, and everyday pantry staples — delivered to your door at prices that make sense.",
        image: getCategoryImage("grains-flour"),
        imageFallback: getCategoryImageFallback("grains-flour"),
        primaryCta: { label: "Shop Now", to: "/shop" },
        secondaryCta: { label: "Explore Bulk Packs", to: "/shop?bulk=true" },
      },
      {
        eyebrow: "Stock up & save",
        title: "Family bulk packs, better value per kg.",
        subtitle:
          "Rice, dal, oil, and atta in bulk sizes built for the whole family — fewer trips to the store, more savings in your pocket.",
        image: getCategoryImage("pulses-beans"),
        imageFallback: getCategoryImageFallback("pulses-beans"),
        primaryCta: { label: "Shop Bulk Packs", to: "/shop?bulk=true" },
        secondaryCta: { label: "Browse All", to: "/shop" },
      },
      {
        eyebrow: "Everyday essentials",
        title: "Cooking essentials, honestly sourced.",
        subtitle:
          "From pure honey to everyday cooking oils — quality you can trust for the essentials that stock your kitchen.",
        image: getCategoryImage("cooking-essentials"),
        imageFallback: getCategoryImageFallback("cooking-essentials"),
        primaryCta: { label: "Shop Essentials", to: "/shop?category=cooking-essentials" },
        secondaryCta: { label: "View Categories", to: "/categories" },
      },
    ],
  },
  footer: {
    brandName: "DaalBhat",
    tagline: "Fresh groceries and family bulk packs, delivered to your door.",
    phone: "+91 98765 43210",
    email: "support@daalbhat.com",
    address: "123 Market Street, Sydney",
    copyrightText: "DaalBhat. All rights reserved.",
    newsletterTitle: "Stay updated",
    newsletterPlaceholder: "Your email",
    socialLinks: {
      facebook: "https://facebook.com/daalbhat",
      instagram: "https://instagram.com/daalbhat",
      twitter: "https://x.com/daalbhat",
      youtube: "https://youtube.com/@daalbhat",
    },
  },
  about: {
    eyebrow: "Our story",
    title: "Groceries that feel like they came from your own backyard.",
    story:
      "DaalBhat started with a simple frustration: fresh groceries shouldn't require choosing between quality, price, and convenience. So we built a place where families can get all three — fast delivery, honest bulk pricing, and produce that actually tastes fresh.",
    values: [
      {
        icon: "Leaf",
        title: "Fresh, always",
        text: "We work directly with local farms so produce reaches you within a day or two of harvest, not weeks.",
      },
      {
        icon: "Truck",
        title: "Delivered fast",
        text: "Same-day delivery on orders placed before 6pm, because groceries shouldn't be a two-day wait.",
      },
      {
        icon: "Users",
        title: "Built for families",
        text: "Family bulk packs at honest per-kg pricing, so stocking up for the week or month doesn't strain the budget.",
      },
      {
        icon: "Heart",
        title: "Quality you can trust",
        text: "Every product is checked before it ships. If something's not right, our return policy has you covered.",
      },
    ],
    ctaTitle: "Ready to see the difference?",
    ctaSubtitle:
      "Browse fresh produce, pantry staples, and family bulk packs — delivered today.",
    ctaButtonText: "Start Shopping",
    ctaButtonLink: "/shop",
  },
  contact: {
    title: "Get in Touch",
    subtitle:
      "Questions about an order, a product, or anything else — we're happy to help.",
    phone: "+91 98765 43210",
    email: "support@daalbhat.com",
    address: "123 Market Street, Sydney",
    hours: "Mon–Sat, 9am – 8pm",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d424141.6978944982!2d150.93197474999997!3d-33.84824395!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b129838f39a743f%3A0x3017d681632a850!2sSydney%20NSW%2C%20Australia!5e0!3m2!1sen!2snp!4v1784896782864!5m2!1sen!2snp",
  },
  faq: {
    title: "Frequently Asked Questions",
    subtitle: "Can't find what you're looking for?",
    contactLinkText: "Contact us",
    items: [
      {
        question: "How fast is delivery?",
        answer:
          "Orders placed before 6pm are delivered the same day in most serviceable areas. Express delivery (next day) is available at checkout for a small additional fee.",
      },
      {
        question: "Is there a minimum order value?",
        answer:
          "No minimum order value. Orders over $700 qualify for free standard delivery — smaller orders have a flat $49 delivery fee.",
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "Cash on Delivery is available now. Card and UPI/wallet payments are coming soon — you'll see the option at checkout once they're live.",
      },
      {
        question: "How do bulk/family packs work?",
        answer:
          "Bulk packs are larger quantities (like a 10kg rice bag or 5L cooking oil can) priced lower per kg than smaller packs — built for families who buy staples regularly and want to shop less often.",
      },
      {
        question: "Can I return a product?",
        answer:
          "Yes — most products can be returned within 7 days if unopened and in original condition. Perishables (fresh produce, dairy) are covered by our freshness guarantee instead; see our Return & Refund Policy for details.",
      },
      {
        question: "How do I track my order?",
        answer:
          "Log in and go to My Account → Order History to see the status of any order, from confirmed through delivered.",
      },
      {
        question: "Do you offer support if something arrives damaged?",
        answer:
          "Absolutely — contact us within 48 hours of delivery with a photo of the item, and we'll arrange a replacement or refund.",
      },
    ],
  },
  "privacy-policy": {
    title: "Privacy Policy",
    updated: "July 2026",
    disclaimer:
      "We respect your privacy and are committed to protecting your personal data.",
    sections: [
      {
        heading: "Information we collect",
        content:
          "When you create an account, place an order, or contact support, we collect information such as your name, email address, phone number, delivery address, and order history. We use this information solely to operate the store — processing orders, providing support, and improving the shopping experience.",
      },
      {
        heading: "How we use your information",
        content:
          "Your information is used to fulfill orders, communicate order updates, respond to support requests, and — with your consent — send occasional offers and newsletters. We do not sell your personal information to third parties.",
      },
      {
        heading: "Data storage and security",
        content:
          "We take reasonable technical and organizational measures to protect your data from unauthorized access, loss, or misuse. No online service can guarantee absolute security, so we encourage using a strong, unique password for your account.",
      },
      {
        heading: "Your rights",
        content:
          "You can review and update your account details at any time from My Account, and you may request deletion of your account and associated data by contacting support.",
      },
      {
        heading: "Contact us",
        content:
          "Questions about this policy can be sent to our support email at support@daalbhat.com.",
      },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    updated: "July 2026",
    disclaimer:
      "Please review the terms of service governing the use of DaalBhat.",
    sections: [
      {
        heading: "Using our site",
        content:
          "By creating an account or placing an order, you agree to provide accurate information and to use the site only for lawful purposes. We may suspend or close accounts used for fraudulent or abusive activity.",
      },
      {
        heading: "Orders and pricing",
        content:
          "All prices are listed in US Dollars ($) and include applicable taxes unless stated otherwise. We reserve the right to correct pricing errors and to cancel orders affected by such errors, with a full refund if payment was already made.",
      },
      {
        heading: "Delivery",
        content:
          "Delivery estimates are shown at checkout and are our best estimate, not a guarantee. Delays due to weather, regional restrictions, or circumstances beyond our control may occasionally occur.",
      },
      {
        heading: "Limitation of liability",
        content:
          "DaalBhat is not liable for indirect or consequential damages arising from use of the site, to the fullest extent permitted by law. Nothing in these terms limits liability that cannot legally be excluded.",
      },
      {
        heading: "Changes to these terms",
        content:
          "We may update these terms from time to time. Continued use of the site after a change constitutes acceptance of the updated terms.",
      },
    ],
  },
  "delivery-information": {
    title: "Delivery Information",
    subtitle:
      "Delivery days, time slots, and charges for every area we currently serve.",
    notices: [
      {
        icon: "Clock",
        title: "Same Day Deliveries",
        text: "Orders placed before 6:00 PM are dispatched on the same day for express delivery zones. Rest assured our logistics network prioritizes fresh produce so your groceries reach you in optimal condition.",
      },
      {
        icon: "Megaphone",
        title: "Delivery Charges & Thresholds",
        text: "Enjoy complimentary free standard delivery on all qualifying orders exceeding $700. For orders under this threshold, nominal regional delivery charges apply as outlined in the schedule above.",
      },
    ],
    calloutText:
      "Not sure which zone you're in? Enter your postcode at checkout and we'll show your exact delivery day, time slot, and charge before you pay.",
  },
  "shipping-policy": {
    title: "Shipping Policy",
    updated: "July 2026",
    sections: [
      {
        heading: "Delivery options",
        content:
          "Standard Delivery takes 2 to 3 days and is free on orders over $700 ($49 flat rate otherwise). Express Delivery is available next day at a $99 flat rate.",
      },
      {
        heading: "Delivery areas",
        content:
          "We currently deliver within our serviceable pin codes, shown automatically at checkout based on your address. If we don't yet deliver to your area, you'll see a message at checkout before placing your order.",
      },
      {
        heading: "Order tracking",
        content:
          "Once your order is confirmed, you can track its status anytime from My Account → Order History.",
      },
      {
        heading: "Missed deliveries",
        content:
          "If you're unavailable at the time of delivery, our courier will attempt to contact you and reschedule. Orders that can't be delivered after repeated attempts may be returned to us and refunded, minus any delivery fee already incurred.",
      },
    ],
  },
  "return-policy": {
    title: "Return & Refund Policy",
    updated: "July 2026",
    sections: [
      {
        heading: "Packaged & non-perishable items",
        content:
          "Unopened packaged goods (pantry staples, personal care, household items) can be returned within 7 days of delivery for a full refund or exchange. Please keep the original packaging where possible.",
      },
      {
        heading: "Fresh produce & perishables",
        content:
          "Dairy and other perishables are covered by our freshness guarantee instead of the standard return window — if something arrives damaged or below quality, contact us within 24 hours of delivery with a photo, and we'll issue a replacement or refund right away.",
      },
      {
        heading: "How to request a return",
        content:
          "Reach out via the Contact page or your Order History with your order number and a brief description of the issue. Most requests are resolved within 1–2 business days.",
      },
      {
        heading: "Refunds",
        content:
          "Approved refunds are issued to your original payment method (or as store credit for Cash on Delivery orders) within 5–7 business days of approval.",
      },
      {
        heading: "Non-returnable items",
        content:
          "For hygiene reasons, opened personal care and baby care items cannot be returned unless defective on arrival.",
      },
    ],
  },
};

const STORAGE_KEY_PREFIX = "daalbhat_cms_";

function getLocalContent(key) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    }
  } catch (err) {
    console.warn(`[contentService] Local read error for ${key}:`, err);
  }
  return DEFAULT_CONTENT[key] || null;
}

function setLocalContent(key, data) {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(data));
  } catch (err) {
    console.warn(`[contentService] Local save error for ${key}:`, err);
  }
}

/**
 * Fetches content for a given section/page from Firestore with fallback.
 */
export async function getContent(key) {
  const fallback = getLocalContent(key) || DEFAULT_CONTENT[key];

  try {
    const docRef = doc(db, "content", key);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const remoteData = snap.data();
      setLocalContent(key, remoteData);
      return remoteData;
    }

    // Return in-memory fallback without auto-seeding to Firestore
    return fallback;
  } catch (err) {
    console.warn(`[contentService] Firestore get failed for ${key}, using fallback:`, err.message);
    return fallback;
  }
}

/**
 * Updates content in Firestore and local storage.
 */
export async function updateContent(key, data) {
  const payload = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, "content", key);
    await setDoc(docRef, payload, { merge: true });
  } catch (err) {
    console.warn(`[contentService] Firestore write failed for ${key}:`, err.message);
  }

  setLocalContent(key, payload);

  // Broadcast event for active UI subscribers
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("daalbhat:content-updated", {
        detail: { key, data: payload },
      })
    );
  }

  return payload;
}

/**
 * Resets a section's content back to initial default values.
 */
export async function resetContentToDefaults(key) {
  const defaultData = DEFAULT_CONTENT[key];
  if (!defaultData) return null;
  return await updateContent(key, defaultData);
}

/**
 * List of all available CMS section keys and labels for admin selector.
 */
export function getAllContentKeys() {
  return [
    { key: "hero", label: "Hero Slider", category: "Home & Layout", icon: "Sparkles" },
    { key: "footer", label: "Footer & Contact", category: "Home & Layout", icon: "Layout" },
    { key: "about", label: "About Us", category: "General Pages", icon: "Info" },
    { key: "contact", label: "Contact Us", category: "General Pages", icon: "Phone" },
    { key: "faq", label: "FAQ", category: "General Pages", icon: "HelpCircle" },
    { key: "privacy-policy", label: "Privacy Policy", category: "Policies & Legal", icon: "ShieldCheck" },
    { key: "terms", label: "Terms & Conditions", category: "Policies & Legal", icon: "FileText" },
    { key: "delivery-information", label: "Delivery Information", category: "Policies & Legal", icon: "Truck" },
    { key: "shipping-policy", label: "Shipping Policy", category: "Policies & Legal", icon: "Package" },
    { key: "return-policy", label: "Return & Refund Policy", category: "Policies & Legal", icon: "RotateCcw" },
  ];
}
