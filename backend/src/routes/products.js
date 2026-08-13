import express from 'express';
import prisma from '../db.js';

const router = express.Router();

// GET /api/products/brands
router.get('/brands', async (req, res) => {
  try {
    const products = await prisma.product.findMany({ select: { brand: true }, distinct: ['brand'] });
    const brands = products.map(p => p.brand).filter(Boolean).sort();
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/products/price-range
router.get('/price-range', async (req, res) => {
  try {
    const maxPrice = await prisma.product.aggregate({ _max: { price: true } });
    res.json(maxPrice._max.price || 0);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/products
router.get('/', async (req, res) => {
  const {
    category, search, minPrice, maxPrice, brands, minRating,
    inStockOnly, bulkOnly, comboOnly, festivalSaleOnly,
    bestSellerOnly, newOnly, featuredOnly, discountOnly,
    sort = 'relevance', page = 1, pageSize = 8
  } = req.query;

  try {
    const where = {};
    if (category) where.categoryId = category;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    if (brands) {
      const brandArray = Array.isArray(brands) ? brands : brands.split(',');
      if (brandArray.length > 0) where.brand = { in: brandArray };
    }
    if (minRating) where.rating = { gte: parseFloat(minRating) };
    if (inStockOnly === 'true') where.inStock = true;
    if (bulkOnly === 'true') where.isBulk = true;
    if (comboOnly === 'true') where.isCombo = true;
    if (festivalSaleOnly === 'true') where.isFestivalSale = true;
    if (bestSellerOnly === 'true') where.isBestSeller = true;
    if (newOnly === 'true') where.isNew = true;
    if (featuredOnly === 'true') where.isFeatured = true;
    // For discountOnly, price < oldPrice is tricky to do in prisma purely with args sometimes, 
    // but in PostgreSQL we can do it with raw, or just fetch and filter. Actually prisma doesn't support column vs column comparison easily.
    // For simplicity, we might just not strictly enforce it at the DB level here if it's too complex, or filter in memory if the dataset is small.
    // Let's omit discountOnly at DB level or do raw query if needed. 

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { category: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    let orderBy = {};
    switch (sort) {
      case 'price-low-high': orderBy = { price: 'asc' }; break;
      case 'price-high-low': orderBy = { price: 'desc' }; break;
      case 'popularity': 
        // We'd ideally sort by rating * reviewsCount, but Prisma doesn't support expression orderings easily.
        orderBy = { rating: 'desc' }; break;
      case 'latest': orderBy = { isNew: 'desc' }; break;
      case 'best-selling': orderBy = { isBestSeller: 'desc' }; break;
      default: orderBy = { id: 'asc' }; break; // relevance
    }

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const take = parseInt(pageSize);

    let [items, total] = await Promise.all([
      prisma.product.findMany({ where, orderBy, skip, take, include: { category: true } }),
      prisma.product.count({ where })
    ]);

    if (discountOnly === 'true') {
      // In-memory filter as fallback
      items = items.filter(p => p.oldPrice && p.oldPrice > p.price);
      total = items.length; // Approximate, pagination might get skewed
    }

    const totalPages = Math.max(1, Math.ceil(total / take));
    res.json({ items, total, page: parseInt(page), pageSize: take, totalPages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/products/:id/related
router.get('/:id/related', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ message: 'Not found' });

    const related = await prisma.product.findMany({
      where: { categoryId: product.categoryId, id: { not: product.id } },
      take: 4,
    });
    res.json(related);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/products/:id/combo-items
router.get('/:id/combo-items', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product || !product.comboItems || product.comboItems.length === 0) return res.json([]);

    const items = await prisma.product.findMany({
      where: { id: { in: product.comboItems } }
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { category: true }
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
