import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OfferStatus, OrderStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderEventsService } from '../order-events/order-events.service';

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELED],
  [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELED],
  [OrderStatus.READY]: [OrderStatus.PICKED_UP, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.CANCELED],
  [OrderStatus.PICKED_UP]: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.CANCELED],
  [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED, OrderStatus.CANCELED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELED]: [],
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderEvents: OrderEventsService,
  ) {}

  async create(customerId: string, dto: CreateOrderDto) {
    if (!dto.offerId && !dto.menuItemId) {
      throw new BadRequestException('Either offerId or menuItemId is required');
    }

    return this.prisma.$transaction(async (tx) => {
      let vendorId: string;
      let offerId: string | null = null;
      let menuItemId: string | null = null;
      let amountKobo = dto.amountKobo;

      if (dto.offerId) {
        const offer = await tx.offer.findUnique({
          where: { id: dto.offerId },
          include: { mealRequest: true },
        });
        if (!offer) {
          throw new NotFoundException('Offer not found');
        }
        const existingOrder = await tx.order.findFirst({ where: { offerId: dto.offerId } });
        if (existingOrder) {
          throw new BadRequestException('Order already exists for this offer');
        }
        if (offer.mealRequest.customerId !== customerId) {
          throw new ForbiddenException('Cannot order for another customer');
        }
        if (offer.status !== OfferStatus.ACCEPTED) {
          throw new BadRequestException('Offer must be accepted before creating an order');
        }
        vendorId = offer.vendorId;
        offerId = offer.id;
        amountKobo = offer.priceKobo;
      } else if (dto.menuItemId) {
        const menuItem = await tx.menuItem.findUnique({
          where: { id: dto.menuItemId },
          include: { menu: true },
        });
        if (!menuItem) {
          throw new NotFoundException('Menu item not found');
        }
        vendorId = menuItem.menu.vendorId;
        menuItemId = menuItem.id;
        amountKobo = menuItem.priceKobo;
      } else {
        throw new BadRequestException('No order source provided');
      }

      const order = await tx.order.create({
        data: {
          customerId,
          vendorId,
          offerId,
          menuItemId,
          amountKobo,
          status: OrderStatus.CONFIRMED,
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
          type: OrderStatus.CONFIRMED,
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

  async findOne(id: string) {
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
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async updateStatus(userId: string, id: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    const rider = await this.prisma.rider.findUnique({ where: { userId } });

    if (order.customerId !== userId && vendor?.id !== order.vendorId && rider?.id !== order.riderId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    const allowedStatuses = ALLOWED_TRANSITIONS[order.status];
    if (!allowedStatuses.includes(dto.status)) {
      throw new BadRequestException(`Cannot transition order from ${order.status} to ${dto.status}`);
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
}
