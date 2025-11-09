import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { ListMenusDto } from './dto/list-menus.dto';

@Injectable()
export class MenusService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string | undefined, query: ListMenusDto) {
    let vendorId = query.vendorId;
    if (!vendorId && userId) {
      const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
      vendorId = vendor?.id;
    }

    if (!vendorId) {
      throw new BadRequestException('vendorId is required');
    }

    return this.prisma.menu.findMany({
      where: { vendorId },
      include: {
        items: {
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createMenu(userId: string, dto: CreateMenuDto) {
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) {
      throw new ForbiddenException('Vendor profile required');
    }

    return this.prisma.menu.create({
      data: {
        vendorId: vendor.id,
        title: dto.title,
      },
    });
  }

  async createMenuItem(userId: string, menuId: string, dto: CreateMenuItemDto) {
    const menu = await this.prisma.menu.findUnique({ where: { id: menuId } });
    if (!menu) {
      throw new NotFoundException('Menu not found');
    }

    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (!vendor || vendor.id !== menu.vendorId) {
      throw new ForbiddenException('You cannot modify this menu');
    }

    return this.prisma.menuItem.create({
      data: {
        menuId,
        name: dto.name,
        nameLocal: dto.nameLocal,
        description: dto.description,
        ingredients: dto.ingredients,
        priceKobo: dto.priceKobo,
        photoUrl: dto.photoUrl,
        cuisineTag: dto.cuisineTag,
        prepMinutes: dto.prepMinutes,
        isAvailable: dto.isAvailable ?? true,
      },
    });
  }

  async updateMenuItem(userId: string, itemId: string, dto: UpdateMenuItemDto) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id: itemId },
      include: { menu: true },
    });

    if (!item) {
      throw new NotFoundException('Menu item not found');
    }

    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (!vendor || vendor.id !== item.menu.vendorId) {
      throw new ForbiddenException('You cannot modify this menu item');
    }

    return this.prisma.menuItem.update({
      where: { id: itemId },
      data: dto,
    });
  }
}
