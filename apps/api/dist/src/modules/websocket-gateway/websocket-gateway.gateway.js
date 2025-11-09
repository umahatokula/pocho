"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OffersGateway_1, OrdersGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersGateway = exports.OffersGateway = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let OffersGateway = OffersGateway_1 = class OffersGateway {
    constructor() {
        this.logger = new common_1.Logger(OffersGateway_1.name);
    }
};
exports.OffersGateway = OffersGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], OffersGateway.prototype, "server", void 0);
exports.OffersGateway = OffersGateway = OffersGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({ namespace: '/ws/offers', cors: true })
], OffersGateway);
let OrdersGateway = OrdersGateway_1 = class OrdersGateway {
    constructor() {
        this.logger = new common_1.Logger(OrdersGateway_1.name);
    }
};
exports.OrdersGateway = OrdersGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], OrdersGateway.prototype, "server", void 0);
exports.OrdersGateway = OrdersGateway = OrdersGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({ namespace: '/ws/orders', cors: true })
], OrdersGateway);
