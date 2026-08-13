import express from 'express';
import prisma from '../db.js';

const router = express.Router();

// GET /api/categories/product-count
router.get('/product-count', async (req, res) => {
  try {
    const counts = await prisma.product.groupBy({
      by: ['categoryId'],
      _count: { id: true },
    });
    
    // Map array to object: { categoryId: count }
    const countsMap = counts.reduce((acc, curr) => {
      acc[curr.categoryId] = curr._count.id;
      return acc;
    }, {});
    
    res.json(countsMap);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/categories/:id
router.get('/:id', async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
    });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
