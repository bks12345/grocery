import bcrypt from 'bcryptjs';
import prisma from '../src/db.js';

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@daalbhat.com' },
    update: {},
    create: {
      email: 'admin@daalbhat.com',
      name: 'Admin',
      phone: '0000000000',
      password: hashedPassword,
      role: 'admin',
    },
  });

  const cat1 = await prisma.category.upsert({
    where: { slug: 'staples' },
    update: {},
    create: {
      name: 'Staples & Grains',
      slug: 'staples',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=300',
    }
  });

  await prisma.product.create({
    data: {
      name: 'Premium Basmati Rice',
      description: 'Long grain aromatic basmati rice perfect for biryani and pulao.',
      price: 250,
      oldPrice: 300,
      categoryId: cat1.id,
      brand: 'Daawat',
      rating: 4.8,
      reviewsCount: 124,
      isBestSeller: true,
      isFeatured: true,
    }
  });

  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      type: 'percent',
      value: 10,
      description: '10% off your order',
    }
  });

  console.log('Seeded database!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
