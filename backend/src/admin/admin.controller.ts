import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { IsString, IsNumber, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { AdminService } from './admin.service';

class CreateMenuItemDto {
  @IsString() name: string;
  @IsString() description: string;
  @IsNumber() price: number;
  @IsNumber() calories: number;
  @IsString() categoryId: string;
  @IsString() imageUrl: string;
  @IsArray() ingredients: string[];
  @IsOptional() @IsBoolean() isRecommended?: boolean;
  @IsOptional() @IsNumber() heat?: number;
}

class UpdateMenuItemDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsNumber() price?: number;
  @IsOptional() @IsNumber() calories?: number;
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsArray() ingredients?: string[];
  @IsOptional() @IsBoolean() isRecommended?: boolean;
  @IsOptional() @IsNumber() heat?: number;
}

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('items')
  async getItems() {
    return this.adminService.getItems();
  }

  @Post('items')
  async createItem(@Body() dto: CreateMenuItemDto) {
    return this.adminService.createItem(dto);
  }

  @Patch('items/:id')
  async updateItem(@Param('id') id: string, @Body() dto: UpdateMenuItemDto) {
    return this.adminService.updateItem(id, dto);
  }

  @Delete('items/:id')
  async deleteItem(@Param('id') id: string) {
    return this.adminService.deleteItem(id);
  }
}
