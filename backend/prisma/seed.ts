import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORIES = [
  { id: 'starters', name: 'Starters', order: 1, icon: 'starters' },
  { id: 'mains', name: 'Main Courses', order: 2, icon: 'mains' },
  { id: 'burgers', name: 'Burgers', order: 3, icon: 'burgers' },
  { id: 'salads', name: 'Salads', order: 4, icon: 'salads' },
  { id: 'drinks', name: 'Drinks', order: 5, icon: 'drinks' },
  { id: 'desserts', name: 'Desserts', order: 6, icon: 'desserts' },
];

// Real food models served from the frontend public/ folder
const MODEL_ZINGER_BURGER = '/models/zinger-burger.glb';
const MODEL_TBONE_STEAK = '/models/t-bone-steak.glb';
const MODEL_SOURDOUGH_BREAD = '/models/sourdough-bread.glb';
const MODEL_SPICY_RAMEN = '/models/spicy-ramen.glb';

async function main() {
  await prisma.processingJob.deleteMany().catch(() => {});
  await prisma.menuItem.deleteMany().catch(() => {});
  await prisma.restaurant.deleteMany().catch(() => {});

  const restaurant = await prisma.restaurant.create({
    data: {
      name: 'The Golden Oak',
      slug: 'golden-oak',
    },
  });

  const menuItems = [
    {
      restaurantId: restaurant.id,
      categoryId: 'burgers',
      name: 'Zinger Burger',
      price: 18.0,
      calories: 850,
      description: 'Crispy fried chicken fillet with secret spice blend, fresh lettuce, mayo, and toasted brioche bun. Photogrammetry-scanned from the real deal.',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&auto=format&fit=crop&q=80',
      modelUrl: MODEL_ZINGER_BURGER,
      usdzUrl: null,
      ingredients: ['Chicken Fillet', 'Brioche Bun', 'Lettuce', 'Mayo', 'Spice Blend'],
      isRecommended: true,
      heat: 2,
      status: 'COMPLETED' as const,
    },
    {
      restaurantId: restaurant.id,
      categoryId: 'mains',
      name: 'T-Bone Steak',
      price: 42.0,
      calories: 1100,
      description: 'Medium-rare T-bone with charred crust, rosemary butter, and roasted garlic. A photogrammetry capture of steakhouse perfection.',
      imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=900&auto=format&fit=crop&q=80',
      modelUrl: MODEL_TBONE_STEAK,
      usdzUrl: null,
      ingredients: ['T-Bone Steak', 'Rosemary Butter', 'Garlic', 'Sea Salt', 'Cracked Pepper'],
      isRecommended: true,
      heat: 1,
      status: 'COMPLETED' as const,
    },
    {
      restaurantId: restaurant.id,
      categoryId: 'starters',
      name: 'Sourdough Bread',
      price: 9.0,
      calories: 320,
      description: 'Artisan sourdough loaf, hand-sliced and served on a wooden board with whipped cultured butter.',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&auto=format&fit=crop&q=80',
      modelUrl: MODEL_SOURDOUGH_BREAD,
      usdzUrl: null,
      ingredients: ['Sourdough', 'Cultured Butter', 'Sea Salt', 'Olive Oil'],
      isRecommended: false,
      heat: 0,
      status: 'COMPLETED' as const,
    },
    {
      restaurantId: restaurant.id,
      categoryId: 'mains',
      name: 'Spicy Ramen',
      price: 22.0,
      calories: 680,
      description: 'Rich tonkotsu broth, hand-pulled noodles, soft-boiled egg, nori, and chili oil. Scanned in full 3D glory.',
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=900&auto=format&fit=crop&q=80',
      modelUrl: MODEL_SPICY_RAMEN,
      usdzUrl: null,
      ingredients: ['Tonkotsu Broth', 'Hand-Pulled Noodles', 'Soft Egg', 'Nori', 'Chili Oil', 'Green Onion'],
      isRecommended: true,
      heat: 3,
      status: 'COMPLETED' as const,
    },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.create({ data: item });
  }

  console.log('Seeded 4 real-food menu items with 3D models');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
