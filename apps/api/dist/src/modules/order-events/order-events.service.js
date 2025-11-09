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
exports.OrderEventsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let OrderEventsService = class OrderEventsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(orderId, type, meta) {
        return this.prisma.orderEvent.create({
            data: {
                orderId,
                type,
                meta,
            },
        });
    }
    async list(orderId, userId) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
        const rider = await this.prisma.rider.findUnique({ where: { userId } });
        const authorized = order.customerId === userId || vendor?.id === order.vendorId || rider?.id === order.riderId;
        if (!authorized) {
            throw new common_1.ForbiddenException('You do not have access to this order timeline');
        }
        return this.prisma.orderEvent.findMany({
            where: { orderId },
            orderBy: { createdAt: 'asc' },
        });
    }
};
exports.OrderEventsService = OrderEventsService;
exports.OrderEventsService = OrderEventsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrderEventsService);
