import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

@Injectable()
export class VendorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateVendorDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== 'VENDOR') {
      throw new ForbiddenException('Only vendor accounts can create vendor profiles');
    }

    const existing = await this.prisma.vendor.findUnique({ where: { userId } });
    if (existing) {
      throw new BadRequestException('Vendor profile already exists');
    }

    return this.prisma.vendor.create({
      data: {
        userId,
        displayName: dto.displayName,
        kmServiceArea: dto.kmServiceArea,
        isVerified: dto.isVerified ?? false,
      },
    });
  }

  async update(userId: string, vendorId: string, dto: UpdateVendorDto) {
    const vendor = await this.prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    if (vendor.userId !== userId) {
      throw new ForbiddenException('You cannot update this vendor');
    }

    return this.prisma.vendor.update({
      where: { id: vendorId },
      data: dto,
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.vendor.findUnique({ where: { userId } });
  }
}
