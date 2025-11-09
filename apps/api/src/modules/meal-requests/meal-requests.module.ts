import { Module } from '@nestjs/common';
import { MealRequestsService } from './meal-requests.service';
import { MealRequestsController } from './meal-requests.controller';

@Module({
  providers: [MealRequestsService],
  controllers: [MealRequestsController],
  exports: [MealRequestsService],
})
export class MealRequestsModule {}
