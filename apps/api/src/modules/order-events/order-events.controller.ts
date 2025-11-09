import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrderEventsService } from './order-events.service';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';

@ApiTags('order-events')
@ApiBearerAuth()
@Controller('order-events')
export class OrderEventsController {
  constructor(private readonly orderEventsService: OrderEventsService) {}

  @Get(':orderId')
  list(@Param('orderId') orderId: string, @CurrentUser() user: RequestUser) {
    return this.orderEventsService.list(orderId, user.sub);
  }
}
