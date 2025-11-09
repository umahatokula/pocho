import { Module } from '@nestjs/common';
import { OffersGateway, OrdersGateway } from './websocket-gateway.gateway';

@Module({
  providers: [OffersGateway, OrdersGateway],
  exports: [OffersGateway, OrdersGateway],
})
export class WebsocketGatewayModule {}
