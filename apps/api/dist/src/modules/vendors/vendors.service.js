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
exports.VendorsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let VendorsService = class VendorsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.role !== 'VENDOR') {
            throw new common_1.ForbiddenException('Only vendor accounts can create vendor profiles');
        }
        const existing = await this.prisma.vendor.findUnique({ where: { userId } });
        if (existing) {
            throw new common_1.BadRequestException('Vendor profile already exists');
        }
        return this.prisma.vendor.create({
            data: {
                userId,
                displayName: dto.displayName,
                kmServiceArea: dto.kmServiceArea,
                isVerified: dto.isVerified ?? false,
            },
        });
    }
    async update(userId, vendorId, dto) {
        const vendor = await this.prisma.vendor.findUnique({ where: { id: vendorId } });
        if (!vendor) {
            throw new common_1.NotFoundException('Vendor not found');
        }
        if (vendor.userId !== userId) {
            throw new common_1.ForbiddenException('You cannot update this vendor');
        }
        return this.prisma.vendor.update({
            where: { id: vendorId },
            data: dto,
        });
    }
    async findByUserId(userId) {
        return this.prisma.vendor.findUnique({ where: { userId } });
    }
};
exports.VendorsService = VendorsService;
exports.VendorsService = VendorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VendorsService);
