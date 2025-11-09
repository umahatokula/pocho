import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class OrderEventsService {
  constructor(private readonly prisma: PrismaService) {}

  create(orderId: string, type: string, meta?: Record<string, unknown>) {
    return this.prisma.orderEvent.create({
      data: {
        orderId,
        type,
        meta,
      },
    });
  }

  async list(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    const rider = await this.prisma.rider.findUnique({ where: { userId } });
    const authorized =
      order.customerId === userId || vendor?.id === order.vendorId || rider?.id === order.riderId;

    if (!authorized) {
      throw new ForbiddenException('You do not have access to this order timeline');
    }

    return this.prisma.orderEvent.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
