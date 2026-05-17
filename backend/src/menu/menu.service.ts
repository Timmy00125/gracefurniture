import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  async getMenu(restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { slug: restaurantId },
    });

    if (!restaurant) {
      return { categories: [], items: [] };
    }

    const categories = [
      { id: 'starters', name: 'Starters', order: 1, icon: 'starters' },
      { id: 'mains', name: 'Main Courses', order: 2, icon: 'mains' },
      { id: 'burgers', name: 'Burgers', order: 3, icon: 'burgers' },
      { id: 'salads', name: 'Salads', order: 4, icon: 'salads' },
      { id: 'drinks', name: 'Drinks', order: 5, icon: 'drinks' },
      { id: 'desserts', name: 'Desserts', order: 6, icon: 'desserts' },
    ];

    const items = await this.prisma.menuItem.findMany({
      where: {
        restaurantId: restaurant.id,
        status: 'COMPLETED',
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      categories,
      items: items.map((item) => ({
        ...item,
        ingredients: item.ingredients as string[],
      })),
    };
  }
}
