import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getItems() {
    const items = await this.prisma.menuItem.findMany({
      orderBy: { createdAt: 'desc' },
      include: { jobs: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    return items.map((item) => ({
      ...item,
      ingredients: item.ingredients as string[],
    }));
  }

  async createItem(dto: any) {
    return this.prisma.menuItem.create({
      data: {
        restaurantId: (await this.prisma.restaurant.findFirst())!.id,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        calories: dto.calories,
        categoryId: dto.categoryId,
        imageUrl: dto.imageUrl,
        ingredients: dto.ingredients || [],
        isRecommended: dto.isRecommended || false,
        heat: dto.heat || 0,
        status: 'PENDING',
      },
    });
  }

  async updateItem(id: string, dto: any) {
    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.price !== undefined) data.price = dto.price;
    if (dto.calories !== undefined) data.calories = dto.calories;
    if (dto.categoryId !== undefined) data.categoryId = dto.categoryId;
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl;
    if (dto.ingredients !== undefined) data.ingredients = dto.ingredients;
    if (dto.isRecommended !== undefined) data.isRecommended = dto.isRecommended;
    if (dto.heat !== undefined) data.heat = dto.heat;

    return this.prisma.menuItem.update({
      where: { id },
      data,
    });
  }

  async deleteItem(id: string) {
    await this.prisma.processingJob.deleteMany({ where: { itemId: id } });
    return this.prisma.menuItem.delete({ where: { id } });
  }
}
