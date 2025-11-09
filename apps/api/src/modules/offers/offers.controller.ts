import { Body, Controller, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { ListOffersDto } from './dto/list-offers.dto';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('offers')
@ApiBearerAuth()
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  @Roles(UserRole.VENDOR)
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateOfferDto) {
    return this.offersService.create(user.sub, dto);
  }

  @Get()
  list(@CurrentUser() user: RequestUser, @Query() query: ListOffersDto) {
    return this.offersService.list(user.sub, query);
  }

  @Post(':id/accept')
  @Roles(UserRole.CUSTOMER)
  @HttpCode(200)
  accept(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.offersService.accept(user.sub, id);
  }
}
