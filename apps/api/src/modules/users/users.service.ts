import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string | undefined) {
    if (!id) {
      return null;
    }
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        phone: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isVerified: true,
        twoFAEnabled: true,
        createdAt: true,
        updatedAt: true,
        vendor: {
          select: {
            id: true,
            displayName: true,
            ratingAvg: true,
            ratingCount: true,
            isVerified: true,
            kmServiceArea: true,
          },
        },
        rider: {
          select: {
            id: true,
            ratingAvg: true,
            ratingCount: true,
            vehicleType: true,
            provider: true,
          },
        },
      },
    });
  }
}
