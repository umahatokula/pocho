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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const order_events_service_1 = require("../order-events/order-events.service");
const ALLOWED_TRANSITIONS = {
    [client_1.OrderStatus.PENDING]: [client_1.OrderStatus.CONFIRMED, client_1.OrderStatus.CANCELED],
    [client_1.OrderStatus.CONFIRMED]: [client_1.OrderStatus.PREPARING, client_1.OrderStatus.CANCELED],
    [client_1.OrderStatus.PREPARING]: [client_1.OrderStatus.READY, client_1.OrderStatus.CANCELED],
    [client_1.OrderStatus.READY]: [client_1.OrderStatus.PICKED_UP, client_1.OrderStatus.OUT_FOR_DELIVERY, client_1.OrderStatus.CANCELED],
    [client_1.OrderStatus.PICKED_UP]: [client_1.OrderStatus.OUT_FOR_DELIVERY, client_1.OrderStatus.CANCELED],
    [client_1.OrderStatus.OUT_FOR_DELIVERY]: [client_1.OrderStatus.DELIVERED, client_1.OrderStatus.CANCELED],
    [client_1.OrderStatus.DELIVERED]: [],
    [client_1.OrderStatus.CANCELED]: [],
};
let OrdersService = class OrdersService {
    constructor(prisma, orderEvents) {
        this.prisma = prisma;
        this.orderEvents = orderEvents;
    }
    async create(customerId, dto) {
        if (!dto.offerId && !dto.menuItemId) {
            throw new common_1.BadRequestException('Either offerId or menuItemId is required');
        }
        return this.prisma.$transaction(async (tx) => {
            let vendorId;
            let offerId = null;
            let menuItemId = null;
            let amountKobo = dto.amountKobo;
            if (dto.offerId) {
                const offer = await tx.offer.findUnique({
                    where: { id: dto.offerId },
                    include: { mealRequest: true },
                });
                if (!offer) {
                    throw new common_1.NotFoundException('Offer not found');
                }
                const existingOrder = await tx.order.findFirst({ where: { offerId: dto.offerId } });
                if (existingOrder) {
                    throw new common_1.BadRequestException('Order already exists for this offer');
                }
                if (offer.mealRequest.customerId !== customerId) {
                    throw new common_1.ForbiddenException('Cannot order for another customer');
                }
                if (offer.status !== client_1.OfferStatus.ACCEPTED) {
                    throw new common_1.BadRequestException('Offer must be accepted before creating an order');
                }
                vendorId = offer.vendorId;
                offerId = offer.id;
                amountKobo = offer.priceKobo;
            }
            else if (dto.menuItemId) {
                const menuItem = await tx.menuItem.findUnique({
                    where: { id: dto.menuItemId },
                    include: { menu: true },
                });
                if (!menuItem) {
                    throw new common_1.NotFoundException('Menu item not found');
                }
                vendorId = menuItem.menu.vendorId;
                menuItemId = menuItem.id;
                amountKobo = menuItem.priceKobo;
            }
            else {
                throw new common_1.BadRequestException('No order source provided');
            }
            const order = await tx.order.create({
                data: {
                    customerId,
                    vendorId,
                    offerId,
                    menuItemId,
                    amountKobo,
                    status: client_1.OrderStatus.CONFIRMED,
                    deliveryLat: dto.deliveryLat,
                    deliveryLng: dto.deliveryLng,
                    etaMinutes: dto.etaMinutes,
                },
            });
            await tx.orderEvent.create({
                data: {
                    orderId: order.id,
                    type: 'CREATED',
                },
            });
            await tx.orderEvent.create({
                data: {
                    orderId: order.id,
                    type: client_1.OrderStatus.CONFIRMED,
                },
            });
            return tx.order.findUnique({
                where: { id: order.id },
                include: {
                    vendor: true,
                    customer: true,
                    offer: true,
                },
            });
        });
    }
    async findOne(id) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                vendor: true,
                customer: true,
                offer: true,
                rider: true,
                events: true,
            },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        return order;
    }
    async updateStatus(userId, id, dto) {
        const order = await this.prisma.order.findUnique({ where: { id } });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
        const rider = await this.prisma.rider.findUnique({ where: { userId } });
        if (order.customerId !== userId && vendor?.id !== order.vendorId && rider?.id !== order.riderId) {
            throw new common_1.ForbiddenException('You do not have access to this order');
        }
        const allowedStatuses = ALLOWED_TRANSITIONS[order.status];
        if (!allowedStatuses.includes(dto.status)) {
            throw new common_1.BadRequestException(`Cannot transition order from ${order.status} to ${dto.status}`);
        }
        const updated = await this.prisma.order.update({
            where: { id },
            data: {
                status: dto.status,
            },
        });
        await this.orderEvents.create(id, dto.status);
        return updated;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        order_events_service_1.OrderEventsService])
], OrdersService);
