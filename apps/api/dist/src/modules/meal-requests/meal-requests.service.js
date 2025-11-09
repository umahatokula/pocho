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
exports.MealRequestsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const list_meal_requests_dto_1 = require("./dto/list-meal-requests.dto");
const EARTH_RADIUS_KM = 6371;
function haversineDistanceKm(aLat, aLng, bLat, bLng) {
    const toRad = (value) => (value * Math.PI) / 180;
    const dLat = toRad(bLat - aLat);
    const dLng = toRad(bLng - aLng);
    const lat1 = toRad(aLat);
    const lat2 = toRad(bLat);
    const sinLat = Math.sin(dLat / 2);
    const sinLng = Math.sin(dLng / 2);
    const a = sinLat * sinLat + sinLng * sinLng * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c;
}
let MealRequestsService = class MealRequestsService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
    }
    async create(customerId, dto) {
        if (dto.budgetMinKobo > dto.budgetMaxKobo) {
            throw new common_1.BadRequestException('budgetMinKobo must be <= budgetMaxKobo');
        }
        const expiryMinutes = this.configService.get('mealRequests.defaultExpiryMinutes', 15);
        const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
        return this.prisma.mealRequest.create({
            data: {
                customerId,
                category: dto.category,
                budgetMinKobo: dto.budgetMinKobo,
                budgetMaxKobo: dto.budgetMaxKobo,
                desiredAt: dto.desiredAt ? new Date(dto.desiredAt) : null,
                deliveryLat: dto.deliveryLat,
                deliveryLng: dto.deliveryLng,
                addressLine: dto.addressLine,
                notes: dto.notes,
                expiresAt,
                maxVendorOffers: dto.maxVendorOffers,
            },
            include: {
                offers: true,
            },
        });
    }
    async findById(id) {
        return this.prisma.mealRequest.findUnique({
            where: { id },
            include: {
                offers: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
    }
    async list(customerId, query) {
        const where = {};
        const now = new Date();
        if (query.status === list_meal_requests_dto_1.MealRequestStatusFilter.OPEN || !query.status) {
            where.expiresAt = { gt: now };
        }
        else if (query.status === list_meal_requests_dto_1.MealRequestStatusFilter.EXPIRED) {
            where.expiresAt = { lte: now };
        }
        if (customerId) {
            where.customerId = customerId;
        }
        let center;
        let radiusKm = this.configService.get('mealRequests.vendorRadiusKm', 5);
        if (query.near) {
            const [latRaw, lngRaw] = query.near.split(',');
            const lat = Number.parseFloat(latRaw);
            const lng = Number.parseFloat(lngRaw);
            if (Number.isNaN(lat) || Number.isNaN(lng)) {
                throw new common_1.BadRequestException('Invalid near parameter. Expected "lat,lng".');
            }
            center = { lat, lng };
            const latDelta = radiusKm / 111;
            const cosLat = Math.cos((lat * Math.PI) / 180);
            const lngDelta = radiusKm / (111 * Math.max(Math.abs(cosLat), 0.0001));
            where.deliveryLat = { gte: lat - latDelta, lte: lat + latDelta };
            where.deliveryLng = { gte: lng - lngDelta, lte: lng + lngDelta };
        }
        const requests = await this.prisma.mealRequest.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                offers: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });
        if (!center) {
            return requests;
        }
        return requests
            .map((request) => ({
            ...request,
            distanceKm: haversineDistanceKm(center.lat, center.lng, request.deliveryLat, request.deliveryLng),
        }))
            .filter((request) => request.distanceKm <= radiusKm)
            .sort((a, b) => a.distanceKm - b.distanceKm);
    }
};
exports.MealRequestsService = MealRequestsService;
exports.MealRequestsService = MealRequestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], MealRequestsService);
