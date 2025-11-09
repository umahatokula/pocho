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
exports.OffersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../common/prisma/prisma.service");
function computeMedian(values) {
    if (values.length === 0) {
        return 0;
    }
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    return sorted[middle];
}
let OffersService = class OffersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        return this.prisma.$transaction(async (tx) => {
            const vendor = await tx.vendor.findUnique({ where: { userId } });
            if (!vendor) {
                throw new common_1.ForbiddenException('Vendor profile is required');
            }
            const mealRequest = await tx.mealRequest.findUnique({
                where: { id: dto.mealRequestId },
            });
            if (!mealRequest) {
                throw new common_1.NotFoundException('Meal request not found');
            }
            if (mealRequest.expiresAt <= new Date()) {
                throw new common_1.BadRequestException('Meal request has expired');
            }
            const existingOffers = await tx.offer.findMany({
                where: { mealRequestId: dto.mealRequestId },
            });
            if (existingOffers.length >= mealRequest.maxVendorOffers) {
                throw new common_1.BadRequestException('Offer limit reached for this meal request');
            }
            const offer = await tx.offer.create({
                data: {
                    mealRequestId: dto.mealRequestId,
                    vendorId: vendor.id,
                    priceKobo: dto.priceKobo,
                    details: dto.details,
                    prepMinutes: dto.prepMinutes,
                    slotFrom: dto.slotFrom ? new Date(dto.slotFrom) : null,
                    slotTo: dto.slotTo ? new Date(dto.slotTo) : null,
                },
            });
            const median = computeMedian([...existingOffers.map((o) => o.priceKobo), offer.priceKobo]);
            const isCompetitive = offer.priceKobo <= median;
            if (isCompetitive !== offer.isCompetitive) {
                await tx.offer.update({
                    where: { id: offer.id },
                    data: { isCompetitive },
                });
            }
            return tx.offer.findUnique({
                where: { id: offer.id },
                include: {
                    vendor: {
                        select: {
                            id: true,
                            displayName: true,
                        },
                    },
                },
            });
        });
    }
    async list(userId, query) {
        const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
        const where = {};
        if (query.mealRequestId) {
            where.mealRequestId = query.mealRequestId;
        }
        if (vendor) {
            where.vendorId = vendor.id;
        }
        else if (!query.mealRequestId) {
            throw new common_1.BadRequestException('mealRequestId is required');
        }
        return this.prisma.offer.findMany({
            where,
            include: {
                vendor: {
                    select: {
                        id: true,
                        displayName: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }
    async accept(customerId, offerId) {
        return this.prisma.$transaction(async (tx) => {
            const offer = await tx.offer.findUnique({
                where: { id: offerId },
                include: { mealRequest: true },
            });
            if (!offer) {
                throw new common_1.NotFoundException('Offer not found');
            }
            if (offer.mealRequest.customerId !== customerId) {
                throw new common_1.ForbiddenException('Only the owner can accept the offer');
            }
            if (offer.mealRequest.expiresAt <= new Date()) {
                throw new common_1.BadRequestException('Meal request has expired');
            }
            if (offer.status !== client_1.OfferStatus.PENDING) {
                throw new common_1.BadRequestException('Offer is not pending');
            }
            await tx.offer.update({
                where: { id: offer.id },
                data: { status: client_1.OfferStatus.ACCEPTED },
            });
            await tx.offer.updateMany({
                where: {
                    mealRequestId: offer.mealRequestId,
                    id: { not: offer.id },
                    status: client_1.OfferStatus.PENDING,
                },
                data: { status: client_1.OfferStatus.WITHDRAWN },
            });
            return tx.offer.findUnique({
                where: { id: offer.id },
                include: { vendor: true },
            });
        });
    }
};
exports.OffersService = OffersService;
exports.OffersService = OffersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OffersService);
