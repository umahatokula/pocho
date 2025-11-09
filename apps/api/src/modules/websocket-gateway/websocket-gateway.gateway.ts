import { Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ namespace: '/ws/offers', cors: true })
export class OffersGateway {
  private readonly logger = new Logger(OffersGateway.name);

  @WebSocketServer()
  server!: Server;
}

@WebSocketGateway({ namespace: '/ws/orders', cors: true })
export class OrdersGateway {
  private readonly logger = new Logger(OrdersGateway.name);

  @WebSocketServer()
  server!: Server;
}
