import express from 'express';
import prisma from '../db.js';
import { authenticate } from './auth.js';
import multer from 'multer';
import sharp from 'sharp';
import { sendOrderStatusUpdate } from '../utils/mailer.js';

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admins only' });
  }
  next();
};

router.use(authenticate, requireAdmin);

// ---- CUSTOMERS ----
router.get('/customers', async (req, res) => {
  try {
    const customers = await prisma.user.findMany();
    const publicUsers = customers.map(({ password, ...rest }) => rest);
    res.json(publicUsers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/customers/:id/block', async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { blocked: req.body.blocked },
    });
    const { password, ...publicUser } = user;
    res.json(publicUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/customers/:id/role', async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role: req.body.role },
    });
    const { password, ...publicUser } = user;
    res.json(publicUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ---- ORDERS ----
router.get('/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { placedAt: 'desc' },
      include: { items: true }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/orders/:orderId/status', async (req, res) => {
  try {
    const order = await prisma.order.update({
      where: { orderId: req.params.orderId },
      data: { status: req.body.status },
      include: { items: true }
    });

    // Handle Status Update Email
    let customerEmail = order.address?.email;
    if (!customerEmail && order.userId) {
      const user = await prisma.user.findUnique({ where: { id: order.userId } });
      customerEmail = user?.email;
    }

    if (customerEmail) {
      sendOrderStatusUpdate(customerEmail, order, req.body.status).catch(e => console.error("Status Email Error:", e));
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/orders/:orderId', async (req, res) => {
  try {
    await prisma.order.delete({
      where: { orderId: req.params.orderId }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/orders', async (req, res) => {
  try {
    await prisma.order.deleteMany({});
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ---- PRODUCTS ----
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded.' });
    }
    
    // Compress image and convert to WebP using sharp
    const compressedImageBuffer = await sharp(req.file.buffer)
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    // Convert buffer to Base64 string
    const base64Image = `data:image/webp;base64,${compressedImageBuffer.toString('base64')}`;

    res.json({ imageUrl: base64Image });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Server error processing image.' });
  }
});

router.get('/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({ include: { category: true } });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/products', async (req, res) => {
  try {
    const { name, description, image, price, oldPrice, brand, rating, reviewsCount, inStock, isBulk, isCombo, isFestivalSale, isBestSeller, isNew, isFeatured, comboItems, category } = req.body;
    
    const product = await prisma.product.create({
      data: {
        name, description, image, price, oldPrice, brand, rating, reviewsCount, inStock, isBulk, isCombo, isFestivalSale, isBestSeller, isNew, isFeatured, comboItems,
        categoryId: category.id
      }
    });
    res.json(product);
  } catch (error) {
    console.error('[ADMIN] Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/products/:id', async (req, res) => {
  try {
    const { name, description, image, price, oldPrice, brand, rating, reviewsCount, inStock, isBulk, isCombo, isFestivalSale, isBestSeller, isNew, isFeatured, comboItems, category } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (price !== undefined) updateData.price = price;
    if (oldPrice !== undefined) updateData.oldPrice = oldPrice;
    if (brand !== undefined) updateData.brand = brand;
    if (rating !== undefined) updateData.rating = rating;
    if (reviewsCount !== undefined) updateData.reviewsCount = reviewsCount;
    if (inStock !== undefined) updateData.inStock = inStock;
    if (isBulk !== undefined) updateData.isBulk = isBulk;
    if (isCombo !== undefined) updateData.isCombo = isCombo;
    if (isFestivalSale !== undefined) updateData.isFestivalSale = isFestivalSale;
    if (isBestSeller !== undefined) updateData.isBestSeller = isBestSeller;
    if (isNew !== undefined) updateData.isNew = isNew;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (comboItems !== undefined) updateData.comboItems = comboItems;
    if (category?.id) updateData.categoryId = category.id;

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: updateData
    });
    res.json(product);
  } catch (error) {
    console.error('[ADMIN] Edit product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ---- CATEGORIES ----
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const category = await prisma.category.create({ data: req.body });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/categories/:id', async (req, res) => {
  try {
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ---- COUPONS ----
router.get('/coupons', async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany();
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/coupons', async (req, res) => {
  try {
    let data = { ...req.body };
    if (data.code) data.code = data.code.toUpperCase();
    if (data.expiresAt) {
      data.expiresAt = new Date(data.expiresAt).toISOString();
    }
    const coupon = await prisma.coupon.create({ data });
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/coupons/:code', async (req, res) => {
  try {
    let updateData = { ...req.body };
    if (updateData.expiresAt) {
      updateData.expiresAt = new Date(updateData.expiresAt).toISOString();
    }
    const coupon = await prisma.coupon.update({
      where: { code: req.params.code.toUpperCase() },
      data: updateData
    });
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/coupons/:code', async (req, res) => {
  try {
    await prisma.coupon.delete({ where: { code: req.params.code.toUpperCase() } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ---- TEMPLATES ----
router.get('/templates', async (req, res) => {
  try {
    const templates = await prisma.emailTemplate.findMany();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/templates/:type', async (req, res) => {
  try {
    const { subject, bodyHtml } = req.body;
    const template = await prisma.emailTemplate.update({
      where: { type: req.params.type },
      data: { subject, bodyHtml }
    });
    res.json(template);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
