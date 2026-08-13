import express from 'express';
import prisma from '../db.js';
import { authenticate } from './auth.js';
import { sendOrderConfirmation, sendAdminNewOrder } from '../utils/mailer.js';
import { goatPartsConfig } from '../data/goatParts.js';

const router = express.Router();

// GET /api/orders
// Get order history for the logged-in user
router.get('/', authenticate, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { placedAt: 'desc' },
      include: { items: true }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { orderId: req.params.id },
      include: { items: true }
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/orders
// Place a new order
router.post('/', authenticate, async (req, res) => {
  const { items, address, deliveryMethod, paymentMethod } = req.body;
  let { couponCode } = req.body;
  const userId = req.user.id;
  
  if (!items || !items.length) {
    return res.status(400).json({ message: 'Cannot place an order with an empty cart' });
  }

  // Generate orderId e.g. GC + last 8 of timestamp
  const orderId = `GC${Date.now().toString().slice(-8)}`;

  const deliveryDays = deliveryMethod === 'express' ? 1 : 3;
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + deliveryDays);
  const estimatedDelivery = estimatedDate.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  try {
    // 1. Fetch real product prices from the database to prevent spoofing
    const rawIds = items
      .map(i => {
        let id = i.product.baseProductId || i.product.id;
        if (id.startsWith('goat_')) id = id.replace('goat_', '');
        return id;
      })
      .filter(id => !id.startsWith('g_')); // Filter out goat parts since they aren't in DB

    const validProducts = await prisma.product.findMany({
      where: { id: { in: rawIds } },
      select: { id: true, price: true, name: true }
    });

    const productMap = new Map(validProducts.map(p => [p.id, p]));

    // 2. Calculate Secure Subtotal
    let secureSubtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      let id = item.product.baseProductId || item.product.id;
      if (id.startsWith('goat_')) id = id.replace('goat_', '');
      
      let price = 0;
      let name = '';
      let isValid = false;

      if (id.startsWith('g_') && goatPartsConfig[id]) {
        price = goatPartsConfig[id].price;
        name = goatPartsConfig[id].name;
        isValid = true;
      } else {
        const dbProduct = productMap.get(id);
        if (dbProduct) {
          price = dbProduct.price;
          name = dbProduct.name;
          isValid = true;
        }
      }

      if (isValid) {
        secureSubtotal += price * item.quantity;
        orderItemsData.push({
          productId: id.startsWith('g_') ? null : id,
          name: id.startsWith('g_') ? `Goat ${name}` : name,
          price: price,
          quantity: item.quantity
        });
      }
    }

    if (orderItemsData.length === 0) {
      return res.status(400).json({ message: 'All items in your cart are invalid or out of stock.' });
    }

    // 3. Calculate Secure Delivery Fee
    let secureDeliveryFee = 0;
    if (deliveryMethod === 'express') {
      secureDeliveryFee = 99;
    } else if (secureSubtotal < 700) {
      secureDeliveryFee = 49;
    } // else 0 (Free delivery over 700)

    // 4. Validate Coupon and Calculate Secure Discount
    let secureDiscount = 0;
    if (couponCode) {
      couponCode = couponCode.trim().toUpperCase();
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      
      if (!coupon || !coupon.active || (coupon.expiresAt && new Date(coupon.expiresAt) < new Date())) {
        return res.status(400).json({ message: 'Invalid, inactive, or expired coupon code.' });
      }

      secureDiscount = coupon.type === 'percent'
        ? Math.round((secureSubtotal * coupon.value) / 100)
        : Math.min(coupon.value, secureSubtotal);
    }

    // 5. Calculate Secure Total
    const secureTotal = Math.max(0, secureSubtotal - secureDiscount + secureDeliveryFee);

    // 6. Save Order
    const order = await prisma.order.create({
      data: {
        orderId,
        user: userId ? { connect: { id: userId } } : undefined,
        estimatedDelivery,
        status: 'confirmed',
        address: address,
        deliveryMethod,
        paymentMethod,
        subtotal: secureSubtotal,
        discount: secureDiscount,
        couponCode,
        deliveryFee: secureDeliveryFee,
        total: secureTotal,
        items: {
          create: orderItemsData
        }
      },
      include: { items: true } // Include items so mailer has access to them
    });

    // Handle Email Notifications
    // 1. Get Admin email
    const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (adminUser?.email) {
      sendAdminNewOrder(adminUser.email, order).catch(e => console.error("Admin Email Error:", e));
    }

    // 2. Get Customer email
    let customerEmail = address?.email;
    if (!customerEmail && userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      customerEmail = user?.email;
    }

    if (customerEmail) {
      sendOrderConfirmation(customerEmail, order).catch(e => console.error("Customer Email Error:", e));
    }

    res.json({ orderId: order.orderId, estimatedDelivery: order.estimatedDelivery });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
