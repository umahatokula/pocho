import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MealRequestsService } from './meal-requests.service';
import { CreateMealRequestDto } from './dto/create-meal-request.dto';
import { ListMealRequestsDto } from './dto/list-meal-requests.dto';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('meal-requests')
@ApiBearerAuth()
@Controller('meal-requests')
export class MealRequestsController {
  constructor(private readonly mealRequestsService: MealRequestsService) {}

  @Post()
  @Roles(UserRole.CUSTOMER)
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateMealRequestDto) {
    return this.mealRequestsService.create(user.sub, dto);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.mealRequestsService.findById(id);
  }

  @Get()
  list(@CurrentUser() user: RequestUser, @Query() query: ListMealRequestsDto) {
    return this.mealRequestsService.list(user?.role === UserRole.CUSTOMER ? user.sub : undefined, query);
  }
}
