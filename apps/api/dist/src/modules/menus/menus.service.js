"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenusService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let MenusService = class MenusService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(userId, query) {
        let vendorId = query.vendorId;
        if (!vendorId && userId) {
            const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
            vendorId = vendor?.id;
        }
        if (!vendorId) {
            throw new common_1.BadRequestException('vendorId is required');
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
    async createMenu(userId, dto) {
        const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
        if (!vendor) {
            throw new common_1.ForbiddenException('Vendor profile required');
        }
        return this.prisma.menu.create({
            data: {
                vendorId: vendor.id,
                title: dto.title,
            },
        });
    }
    async createMenuItem(userId, menuId, dto) {
        const menu = await this.prisma.menu.findUnique({ where: { id: menuId } });
        if (!menu) {
            throw new common_1.NotFoundException('Menu not found');
        }
        const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
        if (!vendor || vendor.id !== menu.vendorId) {
            throw new common_1.ForbiddenException('You cannot modify this menu');
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
    async updateMenuItem(userId, itemId, dto) {
        const item = await this.prisma.menuItem.findUnique({
            where: { id: itemId },
            include: { menu: true },
        });
        if (!item) {
            throw new common_1.NotFoundException('Menu item not found');
        }
        const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
        if (!vendor || vendor.id !== item.menu.vendorId) {
            throw new common_1.ForbiddenException('You cannot modify this menu item');
        }
        return this.prisma.menuItem.update({
            where: { id: itemId },
            data: dto,
        });
    }
};
exports.MenusService = MenusService;
exports.MenusService = MenusService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MenusService);
