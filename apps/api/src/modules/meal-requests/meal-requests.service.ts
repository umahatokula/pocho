import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateMealRequestDto } from './dto/create-meal-request.dto';
import { ListMealRequestsDto, MealRequestStatusFilter } from './dto/list-meal-requests.dto';

const EARTH_RADIUS_KM = 6371;

function haversineDistanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
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

@Injectable()
export class MealRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async create(customerId: string, dto: CreateMealRequestDto) {
    if (dto.budgetMinKobo > dto.budgetMaxKobo) {
      throw new BadRequestException('budgetMinKobo must be <= budgetMaxKobo');
    }

    const expiryMinutes = this.configService.get<number>('mealRequests.defaultExpiryMinutes', 15);
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

  async findById(id: string) {
    return this.prisma.mealRequest.findUnique({
      where: { id },
      include: {
        offers: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async list(customerId: string | undefined, query: ListMealRequestsDto) {
    const where: Prisma.MealRequestWhereInput = {};
    const now = new Date();
    if (query.status === MealRequestStatusFilter.OPEN || !query.status) {
      where.expiresAt = { gt: now };
    } else if (query.status === MealRequestStatusFilter.EXPIRED) {
      where.expiresAt = { lte: now };
    }

    if (customerId) {
      where.customerId = customerId;
    }

    let center: { lat: number; lng: number } | undefined;
    let radiusKm = this.configService.get<number>('mealRequests.vendorRadiusKm', 5);
    if (query.near) {
      const [latRaw, lngRaw] = query.near.split(',');
      const lat = Number.parseFloat(latRaw);
      const lng = Number.parseFloat(lngRaw);
      if (Number.isNaN(lat) || Number.isNaN(lng)) {
        throw new BadRequestException('Invalid near parameter. Expected "lat,lng".');
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
        distanceKm: haversineDistanceKm(
          center!.lat,
          center!.lng,
          request.deliveryLat,
          request.deliveryLng,
        ),
      }))
      .filter((request) => request.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }
}
