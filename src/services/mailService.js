import emailjs from "@emailjs/browser";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { getEmailSenderSettings } from "./adminTemplateService";

/**
 * Dispatches an automated email notification (client-side & serverless).
 * 1. Writes to Firestore `mail` collection (compatible with Firebase Trigger Email extension)
 * 2. Uses EmailJS with full parameter object support
 */
export async function sendEmailNotification({
  to,
  subject,
  html,
  fromEmail,
  fromName,
  orderParams = {},
}) {
  if (!to) {
    console.warn("[mailService] Skipping email dispatch: No recipient email provided.");
    return { success: false, error: "No recipient email" };
  }

  const senderSettings = await getEmailSenderSettings();
  const effectiveSenderEmail = fromEmail || senderSettings.senderEmail || "orders@daalbhat.com";
  const effectiveSenderName = fromName || senderSettings.senderName || "Daalbhat Grocery";

  console.log(`\n======================================================`);
  console.log(`✉️ [EMAIL DISPATCH] ${orderParams.email_title || subject}`);
  console.log(`From: ${effectiveSenderName} <${effectiveSenderEmail}>`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Header Title: ${orderParams.email_title || "N/A"}`);
  console.log(`Status: ${orderParams.status || "N/A"}`);
  console.log(`======================================================\n`);

  // 1. Write to Firestore `mail` collection (Official Firebase Trigger Email format)
  try {
    await addDoc(collection(db, "mail"), {
      to,
      from: `${effectiveSenderName} <${effectiveSenderEmail}>`,
      message: {
        subject,
        html,
      },
      orderParams,
      createdAt: new Date().toISOString(),
      status: "PENDING",
    });
  } catch (err) {
    console.warn("[mailService] Firestore mail queue record warning:", err.message);
  }

  // 2. If EmailJS keys are configured, send live email immediately from browser
  if (
    senderSettings.emailjsServiceId &&
    senderSettings.emailjsTemplateId &&
    senderSettings.emailjsPublicKey
  ) {
    try {
      const templateParams = {
        to_email: to,
        user_email: to,
        email: to,
        recipient: to,
        recipient_email: to,
        to_name: to.split("@")[0],
        name: to.split("@")[0],
        from_name: effectiveSenderName,
        from_email: effectiveSenderEmail,
        reply_to: effectiveSenderEmail,
        subject: subject,
        message: html.replace(/<[^>]*>/g, " ").trim(),
        message_html: html,
        html: html,
        // Header title aliases so all EmailJS template variable names work:
        email_title: orderParams.email_title,
        header_title: orderParams.email_title,
        order_title: orderParams.email_title,
        heading: orderParams.email_title,
        title: orderParams.email_title,
        head: orderParams.email_title,
        ...orderParams,
      };

      const res = await emailjs.send(
        senderSettings.emailjsServiceId.trim(),
        senderSettings.emailjsTemplateId.trim(),
        templateParams,
        senderSettings.emailjsPublicKey.trim()
      );
      console.log(`[mailService] Live email successfully delivered via EmailJS to ${to}`, res);
      return { success: true, live: true };
    } catch (err) {
      const errorMsg =
        err?.text || err?.message || "EmailJS 422: Template parameter mismatch or invalid keys";
      console.warn("[mailService] EmailJS delivery warning:", errorMsg);
      return { success: false, error: errorMsg, queued: true };
    }
  }

  return { success: true, queued: true };
}

/**
 * Builds the HTML receipt layout dynamically based on status.
 */
function buildReceiptHtml({
  title = "Order Confirmed!",
  status = "CONFIRMED",
  statusMessage = "We'll send you tracking information when your order ships.",
  statusColor = "#458500",
  orderId,
  items = [],
  shipping = "0.00",
  tax = "0.00",
  total = "0.00",
  customerEmail = "",
}) {
  const itemsHtml = items
    .map(
      (item) => `
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
        <tr style="vertical-align: top">
          <td style="padding: 12px 8px 0 4px; display: inline-block; width: max-content">
            <img style="height: 64px; width: 64px; object-fit: cover; border-radius: 8px; border: 1px solid #eee;" height="64px" src="${item.image_url}" alt="${item.name}" />
          </td>
          <td style="padding: 12px 8px 0 8px; width: 100%">
            <div style="font-weight: 600; color: #1e293b;">${item.name}</div>
            <div style="font-size: 13px; color: #64748b; padding-top: 4px">QTY: ${item.units}</div>
          </td>
          <td style="padding: 12px 4px 0 0; white-space: nowrap; text-align: right;">
            <strong>$${item.price}</strong>
          </td>
        </tr>
      </table>`
    )
    .join("");

  return `
<div style="font-family: system-ui, -apple-system, sans-serif; font-size: 14px; color: #333; padding: 14px 8px; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
    <!-- Dynamic Header Bar -->
    <div style="border-top: 6px solid ${statusColor}; padding: 18px 20px; background-color: #fafdf5; border-bottom: 1px solid #ecfccb;">
      <span style="font-size: 18px; color: #2d5a00; font-weight: bold; vertical-align: middle;">
        Daalbhat Grocery
      </span>
      <span style="font-size: 15px; vertical-align: middle; border-left: 2px solid ${statusColor}; padding-left: 10px; margin-left: 10px; color: #1e293b;">
        <strong>${title}</strong>
      </span>
    </div>
    <div style="padding: 20px">
      <p style="color: #475569; margin-top: 0; font-size: 14px;">${statusMessage}</p>
      
      <div style="padding-bottom: 8px; border-bottom: 2px solid #333; margin-top: 16px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="text-align: left; font-size: 14px; font-weight: bold; color: #1e293b;">
              Order # ${orderId}
            </td>
            <td style="text-align: right;">
              <span style="background-color: ${statusColor}18; color: ${statusColor}; font-weight: bold; padding: 4px 12px; border-radius: 9999px; font-size: 12px; border: 1px solid ${statusColor}40;">
                ${status}
              </span>
            </td>
          </tr>
        </table>
      </div>
      
      <div style="padding-top: 8px;">
        ${itemsHtml}
      </div>

      <div style="padding: 16px 0;">
        <div style="border-top: 2px solid #e2e8f0"></div>
      </div>
      <table style="border-collapse: collapse; width: 100%; text-align: right; font-size: 14px;">
        <tr>
          <td style="width: 50%"></td>
          <td style="color: #64748b; padding: 4px 8px;">Shipping</td>
          <td style="padding: 4px 8px; white-space: nowrap;">$${shipping}</td>
        </tr>
        <tr>
          <td style="width: 50%"></td>
          <td style="color: #64748b; padding: 4px 8px;">Taxes</td>
          <td style="padding: 4px 8px; white-space: nowrap;">$${tax}</td>
        </tr>
        <tr>
          <td style="width: 50%"></td>
          <td style="border-top: 2px solid #333; padding-top: 8px;">
            <strong style="white-space: nowrap; font-size: 15px;">Order Total</strong>
          </td>
          <td style="padding: 8px 8px; border-top: 2px solid #333; white-space: nowrap; font-size: 16px; color: ${statusColor};">
            <strong>$${total}</strong>
          </td>
        </tr>
      </table>
    </div>
  </div>
  <div style="max-width: 600px; margin: 12px auto; text-align: center;">
    <p style="color: #94a3b8; font-size: 12px; margin: 0;">
      This email was sent to ${customerEmail}<br />
      Status: ${status} | Daalbhat Grocery
    </p>
  </div>
</div>`;
}

/**
 * Sends an Order Confirmation notification to the customer upon checkout.
 */
export async function sendOrderConfirmationEmail(order) {
  try {
    const customerEmail = order.address?.email || order.email;
    if (!customerEmail) return;

    const senderSettings = await getEmailSenderSettings();
    const orderId = order.orderId || order.id;

    const orderItems = (order.items || []).map((item) => ({
      name: item.name || "Grocery Item",
      units: Number(item.quantity || 1),
      price: Number(item.price || 0).toFixed(2),
      image_url:
        item.image ||
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&auto=format&fit=crop&q=80",
    }));

    const shippingCost = Number(order.deliveryFee || 0).toFixed(2);
    const taxCost = "0.00";
    const totalCost = Number(order.total || 0).toFixed(2);

    const title = `Order Confirmed #${orderId}!`;
    const status = "CONFIRMED";
    const statusMessage = "We've received your order and are preparing your fresh groceries.";
    const statusColor = "#458500";

    const bodyHtml = buildReceiptHtml({
      title,
      status,
      statusMessage,
      statusColor,
      orderId,
      items: orderItems,
      shipping: shippingCost,
      tax: taxCost,
      total: totalCost,
      customerEmail,
    });

    const subject = `Order Confirmed #${orderId}!`;

    return await sendEmailNotification({
      to: customerEmail,
      subject,
      html: bodyHtml,
      fromEmail: senderSettings.senderEmail,
      fromName: senderSettings.senderName,
      orderParams: {
        order_id: orderId,
        email_title: title,
        header_title: title,
        order_title: title,
        title: title,
        status: status,
        status_message: statusMessage,
        status_color: statusColor,
        orders: orderItems,
        cost: {
          shipping: shippingCost,
          tax: taxCost,
          total: totalCost,
        },
        cost_shipping: shippingCost,
        cost_tax: taxCost,
        cost_total: totalCost,
        email: customerEmail,
        order_total: totalCost,
      },
    });
  } catch (err) {
    console.error("[mailService] Failed to send order confirmation email:", err);
  }
}

/**
 * Sends an Order Status Update notification to the customer.
 */
export async function sendOrderStatusEmail(order, newStatus) {
  try {
    const customerEmail = order.address?.email || order.email;
    if (!customerEmail) {
      console.warn("[mailService] Cannot send status email: No email on order record.");
      return;
    }

    const senderSettings = await getEmailSenderSettings();
    const customerName = order.address?.fullName || "Valued Customer";
    const orderId = order.orderId || order.id;
    const statusKey = (newStatus || "confirmed").toLowerCase();
    const formattedStatus = statusKey.replace(/_/g, " ").toUpperCase();

    // Map exact titles, subjects, messages, and colors for all possible statuses
    const statusTitles = {
      confirmed: `Order Confirmed #${orderId}!`,
      processing: `Order Processing #${orderId}!`,
      shipped: `Order Shipped #${orderId}!`,
      delivered: `Order Delivered #${orderId}!`,
      cancelled: `Order Cancelled #${orderId}`,
    };

    const statusSubjects = {
      confirmed: `Order Confirmed #${orderId}!`,
      processing: `🔄 Order Processing #${orderId}!`,
      shipped: `🚚 Order Shipped #${orderId}!`,
      delivered: `🎉 Order Delivered #${orderId}!`,
      cancelled: `❌ Order Cancelled #${orderId}`,
    };

    const statusColors = {
      confirmed: "#458500",
      processing: "#0284c7",
      shipped: "#f59e0b",
      delivered: "#16a34a",
      cancelled: "#ef4444",
    };

    const statusMessages = {
      confirmed: `Hello ${customerName}, your order is confirmed and our team is preparing your items.`,
      processing: `Hello ${customerName}, your order is currently being packed with fresh items.`,
      shipped: `Great news ${customerName}! Your groceries are on their way to your address.`,
      delivered: `Hello ${customerName}, your order has been successfully delivered. Enjoy your fresh groceries!`,
      cancelled: `Hello ${customerName}, your order #${orderId} has been cancelled. Please contact us if you need help.`,
    };

    const title = statusTitles[statusKey] || `Order ${formattedStatus} #${orderId}!`;
    const subject = statusSubjects[statusKey] || `Order ${formattedStatus} #${orderId}!`;
    const statusColor = statusColors[statusKey] || "#458500";
    const statusMessage =
      statusMessages[statusKey] ||
      `Hello ${customerName}, your order status has been updated to ${formattedStatus}.`;

    const orderItems = (order.items || []).map((item) => ({
      name: item.name || "Grocery Item",
      units: Number(item.quantity || 1),
      price: Number(item.price || 0).toFixed(2),
      image_url:
        item.image ||
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&auto=format&fit=crop&q=80",
    }));

    const shippingCost = Number(order.deliveryFee || 0).toFixed(2);
    const taxCost = "0.00";
    const totalCost = Number(order.total || 0).toFixed(2);

    const bodyHtml = buildReceiptHtml({
      title,
      status: formattedStatus,
      statusMessage,
      statusColor,
      orderId,
      items: orderItems,
      shipping: shippingCost,
      tax: taxCost,
      total: totalCost,
      customerEmail,
    });

    return await sendEmailNotification({
      to: customerEmail,
      subject,
      html: bodyHtml,
      fromEmail: senderSettings.senderEmail,
      fromName: senderSettings.senderName,
      orderParams: {
        order_id: orderId,
        email_title: title,
        header_title: title,
        order_title: title,
        heading: title,
        title: title,
        head: title,
        status: formattedStatus,
        status_message: statusMessage,
        status_color: statusColor,
        orders: orderItems,
        cost: {
          shipping: shippingCost,
          tax: taxCost,
          total: totalCost,
        },
        cost_shipping: shippingCost,
        cost_tax: taxCost,
        cost_total: totalCost,
        email: customerEmail,
        order_total: totalCost,
      },
    });
  } catch (err) {
    console.error("[mailService] Failed to send order status email:", err);
  }
}

/**
 * Builds HTML for Nepal Custom Sourcing / Delivery Orders.
 */
function buildNepalReceiptHtml({
  title = "Nepal Order Request Received!",
  status = "PENDING",
  statusMessage = "We've received your Nepal order request and will contact you shortly.",
  statusColor = "#458500",
  orderId,
  customerName = "Customer",
  phone = "",
  deliveryAddress = "",
  items = [],
  notes = "",
  customerEmail = "",
}) {
  const itemsRows = (items || [])
    .map(
      (item, idx) => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 10px 8px; font-weight: 600; color: #1e293b;">
          ${idx + 1}. ${item.name || "Custom Item"}
        </td>
        <td style="padding: 10px 8px; text-align: right; color: #64748b; font-weight: 500;">
          ${item.quantity || "1"}
        </td>
      </tr>`
    )
    .join("");

  return `
<div style="font-family: system-ui, -apple-system, sans-serif; font-size: 14px; color: #333; padding: 14px 8px; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
    <!-- Dynamic Header Bar -->
    <div style="border-top: 6px solid ${statusColor}; padding: 20px 24px; background-color: #fafdf5; border-bottom: 1px solid #ecfccb;">
      <span style="font-size: 18px; color: #2d5a00; font-weight: bold; vertical-align: middle;">
        Daalbhat 🇳🇵 Order from Nepal
      </span>
      <span style="font-size: 14px; vertical-align: middle; border-left: 2px solid ${statusColor}; padding-left: 10px; margin-left: 10px; color: #1e293b;">
        <strong>${title}</strong>
      </span>
    </div>
    <div style="padding: 24px">
      <p style="color: #475569; margin-top: 0; font-size: 14px; line-height: 1.5;">${statusMessage}</p>
      
      <div style="padding-bottom: 8px; border-bottom: 2px solid #0f172a; margin-top: 16px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="text-align: left; font-size: 14px; font-weight: bold; color: #1e293b;">
              Order Request # ${orderId}
            </td>
            <td style="text-align: right;">
              <span style="background-color: ${statusColor}18; color: ${statusColor}; font-weight: bold; padding: 4px 12px; border-radius: 9999px; font-size: 12px; border: 1px solid ${statusColor}40;">
                ${status}
              </span>
            </td>
          </tr>
        </table>
      </div>
      
      <!-- Items Table -->
      <div style="padding-top: 12px;">
        <p style="font-size: 12px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.5px; margin-bottom: 6px;">Requested Items (${items.length})</p>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f8fafc; font-size: 12px; color: #64748b; text-align: left;">
              <th style="padding: 8px;">Product</th>
              <th style="padding: 8px; text-align: right;">Quantity</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows || '<tr><td colspan="2" style="padding: 10px; color: #94a3b8;">No items listed</td></tr>'}
          </tbody>
        </table>
      </div>

      <!-- Delivery & Contact Information -->
      <div style="margin-top: 20px; padding: 16px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
        <h4 style="margin: 0 0 8px 0; font-size: 13px; color: #0f172a;">Customer & Delivery Details:</h4>
        <p style="margin: 3px 0; font-size: 13px; color: #475569;"><strong>Customer:</strong> ${customerName}</p>
        <p style="margin: 3px 0; font-size: 13px; color: #475569;"><strong>Phone:</strong> ${phone || "N/A"}</p>
        <p style="margin: 3px 0; font-size: 13px; color: #475569;"><strong>Delivery Address:</strong> ${deliveryAddress || "N/A"}</p>
        ${notes ? `<p style="margin: 6px 0 0 0; font-size: 13px; color: #475569;"><strong>Special Instructions:</strong> <em>${notes}</em></p>` : ""}
      </div>
    </div>
  </div>
  <div style="max-width: 600px; margin: 12px auto; text-align: center;">
    <p style="color: #94a3b8; font-size: 12px; margin: 0;">
      Sent to ${customerEmail || "customer"} · Daalbhat Grocery Platform
    </p>
  </div>
</div>`;
}

/**
 * Dispatches an automated email when an Order from Nepal is submitted.
 */
export async function sendNepalOrderConfirmationEmail(order) {
  try {
    const customerEmail = order.senderEmail || order.email;
    if (!customerEmail) {
      console.warn("[mailService] Cannot send Nepal order email: No customer email provided.");
      return { success: false, error: "No email" };
    }

    const senderSettings = await getEmailSenderSettings();
    const orderId = order.orderId || order.id || `NEP-${Date.now().toString().slice(-6)}`;
    const customerName = order.senderName || order.recipientName || "Valued Customer";
    const phone = order.senderPhone || order.recipientPhone || "";
    const deliveryAddress = order.recipientAddress || order.address || "";
    const items = order.items || [];
    const notes = order.notes || "";

    const title = `Nepal Order Request Received #${orderId}`;
    const status = "PENDING";
    const statusMessage = `Namaste ${customerName}, we have received your custom Nepal order request with ${items.length} item(s). Our team will review the availability and reach out to you shortly on ${phone || "your phone/email"} to confirm details!`;
    const statusColor = "#458500";

    const bodyHtml = buildNepalReceiptHtml({
      title,
      status,
      statusMessage,
      statusColor,
      orderId,
      customerName,
      phone,
      deliveryAddress,
      items,
      notes,
      customerEmail,
    });

    const subject = `🇳🇵 Order from Nepal Received - #${orderId}`;

    return await sendEmailNotification({
      to: customerEmail,
      subject,
      html: bodyHtml,
      fromEmail: senderSettings.senderEmail,
      fromName: senderSettings.senderName,
      orderParams: {
        order_id: orderId,
        email_title: title,
        header_title: title,
        order_title: title,
        heading: title,
        title: title,
        status: status,
        status_message: statusMessage,
        status_color: statusColor,
        customer_name: customerName,
        phone: phone,
        delivery_address: deliveryAddress,
        notes: notes,
        email: customerEmail,
      },
    });
  } catch (err) {
    console.error("[mailService] Failed to send Nepal order confirmation email:", err);
  }
}

/**
 * Dispatches an automated email when Nepal Order status changes in Admin Panel.
 */
export async function sendNepalOrderStatusEmail(order, newStatus, customNotes = "") {
  try {
    const customerEmail = order.senderEmail || order.email;
    if (!customerEmail) {
      console.warn("[mailService] Cannot send Nepal status email: No customer email provided.");
      return { success: false, error: "No email" };
    }

    const senderSettings = await getEmailSenderSettings();
    const orderId = order.orderId || order.id || `NEP-${Date.now().toString().slice(-6)}`;
    const customerName = order.senderName || order.recipientName || "Valued Customer";
    const phone = order.senderPhone || order.recipientPhone || "";
    const deliveryAddress = order.recipientAddress || order.address || "";
    const items = order.items || [];
    const notes = customNotes || order.notes || "";

    const statusKey = (newStatus || "confirmed").toLowerCase();
    const formattedStatus = statusKey.replace(/_/g, " ").toUpperCase();

    const statusColors = {
      pending: "#458500",
      confirmed: "#0284c7",
      shipped: "#f59e0b",
      delivered: "#16a34a",
      cancelled: "#ef4444",
    };

    const statusMessages = {
      pending: `Hello ${customerName}, your Nepal order request is pending review by our team.`,
      confirmed: `Hello ${customerName}, great news! Your Nepal order has been confirmed and our sourcing team in Nepal is preparing your items.`,
      shipped: `Hello ${customerName}, your items from Nepal have been dispatched and are in transit for delivery to your address.`,
      delivered: `Hello ${customerName}, your Nepal order has been delivered successfully. Thank you for shopping with Daalbhat!`,
      cancelled: `Hello ${customerName}, your Nepal order #${orderId} has been cancelled. Please reach out to us if you have any questions.`,
    };

    const title = `Nepal Order ${formattedStatus} #${orderId}`;
    const subject = `🇳🇵 Nepal Order Status Update: ${formattedStatus} - #${orderId}`;
    const statusColor = statusColors[statusKey] || "#458500";
    const statusMessage = statusMessages[statusKey] || `Hello ${customerName}, your Nepal order status is now ${formattedStatus}.`;

    const bodyHtml = buildNepalReceiptHtml({
      title,
      status: formattedStatus,
      statusMessage,
      statusColor,
      orderId,
      customerName,
      phone,
      deliveryAddress,
      items,
      notes,
      customerEmail,
    });

    return await sendEmailNotification({
      to: customerEmail,
      subject,
      html: bodyHtml,
      fromEmail: senderSettings.senderEmail,
      fromName: senderSettings.senderName,
      orderParams: {
        order_id: orderId,
        email_title: title,
        header_title: title,
        order_title: title,
        heading: title,
        title: title,
        status: formattedStatus,
        status_message: statusMessage,
        status_color: statusColor,
        customer_name: customerName,
        phone: phone,
        delivery_address: deliveryAddress,
        notes: notes,
        email: customerEmail,
      },
    });
  } catch (err) {
    console.error("[mailService] Failed to send Nepal order status email:", err);
  }
}

