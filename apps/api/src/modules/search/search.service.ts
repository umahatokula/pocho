import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SearchQueryDto } from './dto/search-query.dto';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: SearchQueryDto) {
    const q = query.q?.trim();
    const skip = query.skip ?? 0;
    const take = query.take ?? 10;

    const [vendors, menuItems] = await Promise.all([
      this.prisma.vendor.findMany({
        where: q
          ? {
              displayName: {
                contains: q,
                mode: 'insensitive',
              },
            }
          : {},
        skip,
        take,
      }),
      this.prisma.menuItem.findMany({
        where: q
          ? {
              name: {
                contains: q,
                mode: 'insensitive',
              },
            }
          : {},
        skip,
        take,
      }),
    ]);

    return {
      vendors,
      menuItems,
    };
  }
}
