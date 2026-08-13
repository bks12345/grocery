import { categories } from './seed-data/categories.js';
import { products } from './seed-data/products.js';
import { goatParts } from './seed-data/goatParts.js';
import prisma from '../src/db.js';

async function main() {
  console.log('Clearing existing data...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  console.log('Seeding categories...');
  for (const cat of categories) {
    await prisma.category.create({
      data: {
        id: cat.id,
        name: cat.name,
        slug: cat.id,
      },
    });
  }

  console.log('Seeding products...');
  for (const prod of products) {
    await prisma.product.create({
      data: {
        id: prod.id,
        name: prod.name,
        description: prod.description || null,
        price: prod.price,
        oldPrice: prod.oldPrice || null,
        brand: prod.brand,
        rating: prod.rating || 0,
        reviewsCount: prod.reviewsCount || 0,
        inStock: prod.inStock ?? true,
        isBulk: prod.isBulk ?? false,
        isFeatured: prod.isFeatured ?? false,
        isBestSeller: prod.isBestSeller ?? false,
        isNew: prod.isNew ?? false,
        isFestivalSale: prod.isFestivalSale ?? false,
        categoryId: prod.category, // Relates to the category id we just seeded
      },
    });
  }

  console.log('Seeding goat parts category and products...');
  await prisma.category.create({
    data: {
      id: 'goat-parts',
      name: 'Book a Goat',
      slug: 'goat-parts',
    }
  });

  for (const part of goatParts) {
    await prisma.product.create({
      data: {
        id: part.id,
        name: part.name,
        price: part.pricePerKg,
        brand: 'Fresh Meat',
        categoryId: 'goat-parts',
        inStock: true,
      }
    });
  }

  console.log('Done seeding mock data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
