import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { InitPaymentDto } from './dto/init-payment.dto';

export enum PaymentProvider {
  PAYSTACK = 'PAYSTACK',
  FLUTTERWAVE = 'FLUTTERWAVE',
}

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async init(customerId: string, dto: InitPaymentDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });
    if (!order) {
      throw new BadRequestException('Order not found');
    }
    if (order.customerId !== customerId) {
      throw new ForbiddenException('Cannot initialize payment for another customer');
    }

    const reference = randomUUID();
    const payment = await this.prisma.payment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        provider: dto.provider,
        status: PaymentStatus.INITIATED,
        reference,
        amountKobo: order.amountKobo,
      },
      update: {
        provider: dto.provider,
        status: PaymentStatus.INITIATED,
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

  private mapStatus(status: string | undefined): PaymentStatus {
    switch ((status ?? '').toUpperCase()) {
      case 'SUCCESS':
        return PaymentStatus.SUCCESS;
      case 'FAILED':
        return PaymentStatus.FAILED;
      case 'REFUNDED':
        return PaymentStatus.REFUNDED;
      default:
        return PaymentStatus.FAILED;
    }
  }

  async processWebhook(provider: PaymentProvider, signature: string | undefined, payload: any) {
    const reference = payload?.data?.reference ?? payload?.reference;
    if (!reference) {
      throw new BadRequestException('Payment reference missing');
    }

    const status = this.mapStatus(payload?.data?.status ?? payload?.status);

    const orderId = payload?.data?.metadata?.orderId ?? payload?.orderId;
    if (!orderId) {
      throw new BadRequestException('Order identifier missing in webhook payload');
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
      const updateData: { paymentId?: string; status?: OrderStatus } = { paymentId: payment.id };
      if (status === PaymentStatus.SUCCESS) {
        updateData.status = OrderStatus.CONFIRMED;
      } else if (status === PaymentStatus.FAILED || status === PaymentStatus.REFUNDED) {
        updateData.status = OrderStatus.CANCELED;
      }

      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: updateData,
      });
    }

    return { received: true };
  }
}
