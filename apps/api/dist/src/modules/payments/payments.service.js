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
exports.PaymentsService = exports.PaymentProvider = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../../common/prisma/prisma.service");
var PaymentProvider;
(function (PaymentProvider) {
    PaymentProvider["PAYSTACK"] = "PAYSTACK";
    PaymentProvider["FLUTTERWAVE"] = "FLUTTERWAVE";
})(PaymentProvider || (exports.PaymentProvider = PaymentProvider = {}));
let PaymentsService = class PaymentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async init(customerId, dto) {
        const order = await this.prisma.order.findUnique({
            where: { id: dto.orderId },
        });
        if (!order) {
            throw new common_1.BadRequestException('Order not found');
        }
        if (order.customerId !== customerId) {
            throw new common_1.ForbiddenException('Cannot initialize payment for another customer');
        }
        const reference = (0, crypto_1.randomUUID)();
        const payment = await this.prisma.payment.upsert({
            where: { orderId: order.id },
            create: {
                orderId: order.id,
                provider: dto.provider,
                status: client_1.PaymentStatus.INITIATED,
                reference,
                amountKobo: order.amountKobo,
            },
            update: {
                provider: dto.provider,
                status: client_1.PaymentStatus.INITIATED,
                reference,
                amountKobo: order.amountKobo,
                rawPayload: null,
            },
        });
        return {
            provider: payment.provider,
            reference: payment.reference,
            amountKobo: payment.amountKobo,
            checkoutUrl: `https://payments.pocho.local/${payment.provider.toLowerCase()}/${payment.reference}`,
        };
    }
    mapStatus(status) {
        switch ((status ?? '').toUpperCase()) {
            case 'SUCCESS':
                return client_1.PaymentStatus.SUCCESS;
            case 'FAILED':
                return client_1.PaymentStatus.FAILED;
            case 'REFUNDED':
                return client_1.PaymentStatus.REFUNDED;
            default:
                return client_1.PaymentStatus.FAILED;
        }
    }
    async processWebhook(provider, signature, payload) {
        const reference = payload?.data?.reference ?? payload?.reference;
        if (!reference) {
            throw new common_1.BadRequestException('Payment reference missing');
        }
        const status = this.mapStatus(payload?.data?.status ?? payload?.status);
        const orderId = payload?.data?.metadata?.orderId ?? payload?.orderId;
        if (!orderId) {
            throw new common_1.BadRequestException('Order identifier missing in webhook payload');
        }
        const payment = await this.prisma.payment.upsert({
            where: { reference },
            create: {
                orderId,
                provider,
                status,
                reference,
                amountKobo: payload?.data?.amount ?? payload?.amount ?? 0,
                rawPayload: payload,
            },
            update: {
                status,
                rawPayload: payload,
            },
        });
        if (payment.orderId) {
            const updateData = { paymentId: payment.id };
            if (status === client_1.PaymentStatus.SUCCESS) {
                updateData.status = client_1.OrderStatus.CONFIRMED;
            }
            else if (status === client_1.PaymentStatus.FAILED || status === client_1.PaymentStatus.REFUNDED) {
                updateData.status = client_1.OrderStatus.CANCELED;
            }
            await this.prisma.order.update({
                where: { id: payment.orderId },
                data: updateData,
            });
        }
        return { received: true };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
