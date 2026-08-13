import express from 'express';
import prisma from '../db.js';
import { sendOrderConfirmation, sendAdminNewOrder } from '../utils/mailer.js';

const router = express.Router();

// POST /api/nepal-orders
router.post('/', async (req, res) => {
  const { senderName, senderEmail, senderPhone, recipientName, recipientPhone, recipientAddress, items, totalValue } = req.body;
  
  if (!senderName || !senderEmail || !recipientName || !recipientPhone || !recipientAddress || !items) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const nepalOrder = await prisma.nepalOrder.create({
      data: {
        senderName,
        senderEmail,
        senderPhone: senderPhone || '',
        recipientName,
        recipientPhone,
        recipientAddress,
        items, // JSON array
        totalValue: totalValue || 0,
      },
    });

    // Send emails
    const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (adminUser?.email) {
      sendAdminNewOrder(adminUser.email, {
        orderId: nepalOrder.id,
        status: nepalOrder.status,
        placedAt: nepalOrder.createdAt,
        total: nepalOrder.totalValue,
        address: { fullName: nepalOrder.senderName },
        deliveryMethod: 'Nepal Delivery',
      }).catch(e => console.error("Admin Email Error (Nepal Order):", e));
    }

    // nepalOrder.items is stored as JSON array. Parse if it's a string, or map directly if it's an object.
    const parsedItems = typeof nepalOrder.items === 'string' ? JSON.parse(nepalOrder.items) : nepalOrder.items;

    sendOrderConfirmation(senderEmail, {
      orderId: nepalOrder.id,
      status: nepalOrder.status,
      placedAt: nepalOrder.createdAt,
      total: nepalOrder.totalValue,
      address: { fullName: nepalOrder.senderName },
      estimatedDelivery: '3-5 business days',
      items: Array.isArray(parsedItems) ? parsedItems : [],
    }).catch(e => console.error("Customer Email Error (Nepal Order):", e));

    res.status(201).json({ success: true, message: 'Order created successfully.', orderId: nepalOrder.id });
  } catch (error) {
    console.error('Nepal Order endpoint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
