import { Module } from '@nestjs/common';
import { OrderEventsService } from './order-events.service';
import { OrderEventsController } from './order-events.controller';

@Module({
  providers: [OrderEventsService],
  controllers: [OrderEventsController],
  exports: [OrderEventsService],
})
export class OrderEventsModule {}
