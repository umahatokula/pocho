import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OfferStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { ListOffersDto } from './dto/list-offers.dto';

function computeMedian(values: number[]): number {
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

@Injectable()
export class OffersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateOfferDto) {
    return this.prisma.$transaction(async (tx) => {
      const vendor = await tx.vendor.findUnique({ where: { userId } });
      if (!vendor) {
        throw new ForbiddenException('Vendor profile is required');
      }

      const mealRequest = await tx.mealRequest.findUnique({
        where: { id: dto.mealRequestId },
      });
      if (!mealRequest) {
        throw new NotFoundException('Meal request not found');
      }
      if (mealRequest.expiresAt <= new Date()) {
        throw new BadRequestException('Meal request has expired');
      }

      const existingOffers = await tx.offer.findMany({
        where: { mealRequestId: dto.mealRequestId },
      });
      if (existingOffers.length >= mealRequest.maxVendorOffers) {
        throw new BadRequestException('Offer limit reached for this meal request');
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

  async list(userId: string, query: ListOffersDto) {
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    const where: Prisma.OfferWhereInput = {};
    if (query.mealRequestId) {
      where.mealRequestId = query.mealRequestId;
    }
    if (vendor) {
      where.vendorId = vendor.id;
    } else if (!query.mealRequestId) {
      throw new BadRequestException('mealRequestId is required');
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

  async accept(customerId: string, offerId: string) {
    return this.prisma.$transaction(async (tx) => {
      const offer = await tx.offer.findUnique({
        where: { id: offerId },
        include: { mealRequest: true },
      });
      if (!offer) {
        throw new NotFoundException('Offer not found');
      }
      if (offer.mealRequest.customerId !== customerId) {
        throw new ForbiddenException('Only the owner can accept the offer');
      }
      if (offer.mealRequest.expiresAt <= new Date()) {
        throw new BadRequestException('Meal request has expired');
      }
      if (offer.status !== OfferStatus.PENDING) {
        throw new BadRequestException('Offer is not pending');
      }

      await tx.offer.update({
        where: { id: offer.id },
        data: { status: OfferStatus.ACCEPTED },
      });

      await tx.offer.updateMany({
        where: {
          mealRequestId: offer.mealRequestId,
          id: { not: offer.id },
          status: OfferStatus.PENDING,
        },
        data: { status: OfferStatus.WITHDRAWN },
      });

      return tx.offer.findUnique({
        where: { id: offer.id },
        include: { vendor: true },
      });
    });
  }
}
