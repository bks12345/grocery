import express from 'express';
import prisma from '../db.js';

const router = express.Router();

// GET /api/coupons
router.get('/', async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      where: { active: true },
    });
    
    // Filter out expired coupons
    const activeCoupons = coupons.filter(c => !c.expiresAt || new Date(c.expiresAt) > new Date());
    res.json(activeCoupons);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/coupons/validate
router.post('/validate', async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ message: 'Code is required' });

  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() }
    });

    if (!coupon) return res.status(400).json({ message: 'Invalid coupon code.' });
    if (!coupon.active) return res.status(400).json({ message: 'This coupon is no longer active.' });
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ message: 'This coupon has expired.' });
    }

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
