import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Force load from backend/.env explicitly to avoid dotenvx interception
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const RESEND_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_KEY ? new Resend(RESEND_KEY) : null;
const SENDER_EMAIL = 'Daalbhat Support <onboarding@resend.dev>';

// Helper to log a mock email if Resend is missing or fails
const logMockEmail = (to, subject, body) => {
  console.log(`\n==============================================`);
  console.log(`[MOCK EMAIL] To: ${to}`);
  console.log(`[MOCK EMAIL] Subject: ${subject}`);
  console.log(`[MOCK EMAIL] Body:\n${body.replace(/<[^>]*>?/gm, '')}`);
  console.log(`==============================================\n`);
};

import prisma from '../db.js';

// Generic send function with robust error handling
export const sendEmail = async ({ to, subject, html }) => {
  if (RESEND_KEY) {
    try {
      const { data, error } = await resend.emails.send({
        from: SENDER_EMAIL,
        to,
        subject,
        html
      });
      
      if (error) {
        console.error('[MAILER] Resend API Error:', error);
        logMockEmail(to, subject, html);
        return false;
      } else {
        console.log(`[MAILER] Sent email via Resend to ${to}. ID: ${data?.id}`);
        return true;
      }
    } catch (emailError) {
      console.error('[MAILER] Failed to send email via Resend exception:', emailError);
      logMockEmail(to, subject, html);
      return false;
    }
  } else {
    logMockEmail(to, subject, html);
    return false;
  }
};

// 1. Order Confirmation (To User)
export const sendOrderConfirmation = async (email, orderDetails) => {
  const template = await prisma.emailTemplate.findUnique({ where: { type: 'order_confirmation' } });
  if (!template) return;

  const orderSummaryHTML = (orderDetails.items || []).map(item => `
    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
      <span>${item.name} x ${item.quantity}</span>
      <span>$${item.price * item.quantity}</span>
    </div>
  `).join('');

  let orderType = 'Grocery Order';
  if (orderDetails.deliveryMethod === 'Nepal Delivery') orderType = 'Order from Nepal';
  else if ((orderDetails.items || []).some(i => i.name.startsWith('Goat'))) orderType = 'Book a Goat';

  const address = orderDetails.address || {};
  const addressHTML = `
    <div style="margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 8px;">
      <h3 style="margin-top:0; color: #374151;">Order Type: ${orderType}</h3>
      <h4 style="margin-bottom:4px; color: #374151;">Delivery Address</h4>
      <p style="margin:0; color: #4b5563;">
        ${address.fullName || address.recipientName || 'N/A'}<br>
        ${address.phone || address.recipientPhone || ''}<br>
        ${address.addressLine || address.recipientAddress || ''} ${address.city || ''} ${address.pincode || ''}
      </p>
    </div>
  `;

  const subject = template.subject.replace('{{orderId}}', orderDetails.orderId);
  let html = template.bodyHtml
    .replace(/{{orderId}}/g, orderDetails.orderId)
    .replace(/{{estimatedDelivery}}/g, orderDetails.estimatedDelivery)
    .replace(/{{orderSummaryHTML}}/g, orderSummaryHTML)
    .replace(/{{total}}/g, orderDetails.total);

  // Append full details if not natively supported by the template
  if (!html.includes(orderType)) {
    html += addressHTML;
  }

  await sendEmail({ to: email, subject, html });
};

// 2. New Order Notification (To Admin)
export const sendAdminNewOrder = async (adminEmail, orderDetails) => {
  const template = await prisma.emailTemplate.findUnique({ where: { type: 'admin_new_order' } });
  if (!template) return;

  let orderType = 'Grocery Order';
  if (orderDetails.deliveryMethod === 'Nepal Delivery') orderType = 'Order from Nepal';
  else if ((orderDetails.items || []).some(i => i.name.startsWith('Goat'))) orderType = 'Book a Goat';

  const orderSummaryHTML = (orderDetails.items || []).map(item => `
    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
      <span>${item.name} x ${item.quantity}</span>
      <span>$${item.price * item.quantity}</span>
    </div>
  `).join('');

  const address = orderDetails.address || {};
  const fullDetailsHTML = `
    <div style="margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 8px;">
      <h3 style="margin-top:0; color: #374151;">Order Type: ${orderType}</h3>
      
      <h4 style="margin-bottom:4px; color: #374151;">Order Items</h4>
      <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;">
        ${orderSummaryHTML}
        <div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 10px;">
          <span>Total</span>
          <span>$${orderDetails.total}</span>
        </div>
      </div>

      <h4 style="margin-bottom:4px; color: #374151;">Delivery Details</h4>
      <p style="margin:0; color: #4b5563;">
        ${address.fullName || address.recipientName || 'N/A'}<br>
        ${address.phone || address.recipientPhone || ''}<br>
        ${address.addressLine || address.recipientAddress || ''} ${address.city || ''} ${address.pincode || ''}
      </p>
    </div>
  `;

  const subject = template.subject.replace('{{orderId}}', orderDetails.orderId);
  let html = template.bodyHtml
    .replace(/{{orderId}}/g, orderDetails.orderId)
    .replace(/{{total}}/g, orderDetails.total)
    .replace(/{{deliveryMethod}}/g, orderDetails.deliveryMethod);
    
  html += fullDetailsHTML;

  await sendEmail({ to: adminEmail, subject, html });
};

// 3. Order Status Update (To User)
export const sendOrderStatusUpdate = async (email, orderDetails, newStatus) => {
  const template = await prisma.emailTemplate.findUnique({ where: { type: 'order_status' } });
  if (!template) return;

  const displayStatus = newStatus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const subject = template.subject.replace('{{orderId}}', orderDetails.orderId);
  const html = template.bodyHtml
    .replace(/{{orderId}}/g, orderDetails.orderId)
    .replace(/{{status}}/g, displayStatus);

  await sendEmail({ to: email, subject, html });
};
