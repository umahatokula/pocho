"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const event_emitter_1 = require("@nestjs/event-emitter");
const terminus_1 = require("@nestjs/terminus");
const throttler_1 = require("@nestjs/throttler");
const bullmq_1 = require("@nestjs/bullmq");
const nestjs_prometheus_1 = require("@willsoto/nestjs-prometheus");
const nestjs_pino_1 = require("nestjs-pino");
const nestjs_i18n_1 = require("nestjs-i18n");
const path_1 = require("path");
const configuration_1 = __importDefault(require("./config/configuration"));
const validation_1 = __importDefault(require("./config/validation"));
const prisma_module_1 = require("./common/prisma/prisma.module");
const health_module_1 = require("./common/health/health.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const response_transform_interceptor_1 = require("./common/interceptors/response-transform.interceptor");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const roles_guard_1 = require("./common/guards/roles.guard");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const vendors_module_1 = require("./modules/vendors/vendors.module");
const menus_module_1 = require("./modules/menus/menus.module");
const meal_requests_module_1 = require("./modules/meal-requests/meal-requests.module");
const offers_module_1 = require("./modules/offers/offers.module");
const orders_module_1 = require("./modules/orders/orders.module");
const order_events_module_1 = require("./modules/order-events/order-events.module");
const riders_module_1 = require("./modules/riders/riders.module");
const payments_module_1 = require("./modules/payments/payments.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const search_module_1 = require("./modules/search/search.module");
const files_module_1 = require("./modules/files/files.module");
const reviews_module_1 = require("./modules/reviews/reviews.module");
const admin_module_1 = require("./modules/admin/admin.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const websocket_gateway_module_1 = require("./modules/websocket-gateway/websocket-gateway.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
                validationSchema: validation_1.default,
                cache: true,
                expandVariables: true,
            }),
            nestjs_pino_1.LoggerModule.forRoot(),
            nestjs_prometheus_1.PrometheusModule.register(),
            nestjs_i18n_1.I18nModule.forRoot({
                fallbackLanguage: 'en',
                loader: nestjs_i18n_1.I18nJsonLoader,
                loaderOptions: {
                    path: (0, path_1.join)(__dirname, 'i18n'),
                    watch: false,
                },
                resolvers: [
                    { use: nestjs_i18n_1.QueryResolver, options: ['lang'] },
                    nestjs_i18n_1.AcceptLanguageResolver,
                ],
            }),
            event_emitter_1.EventEmitterModule.forRoot(),
            terminus_1.TerminusModule,
            throttler_1.ThrottlerModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: async (config) => ({
                    ttl: config.get('rateLimit.ttl', 60),
                    limit: config.get('rateLimit.limit', 100),
                }),
            }),
            bullmq_1.BullModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    connection: config.get('redis'),
                }),
            }),
            prisma_module_1.PrismaModule,
            health_module_1.HealthModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            vendors_module_1.VendorsModule,
            menus_module_1.MenusModule,
            meal_requests_module_1.MealRequestsModule,
            offers_module_1.OffersModule,
            orders_module_1.OrdersModule,
            order_events_module_1.OrderEventsModule,
            riders_module_1.RidersModule,
            payments_module_1.PaymentsModule,
            notifications_module_1.NotificationsModule,
            search_module_1.SearchModule,
            files_module_1.FilesModule,
            reviews_module_1.ReviewsModule,
            admin_module_1.AdminModule,
            analytics_module_1.AnalyticsModule,
            websocket_gateway_module_1.WebsocketGatewayModule,
        ],
        providers: [
            {
                provide: core_1.APP_FILTER,
                useClass: http_exception_filter_1.HttpExceptionFilter,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: response_transform_interceptor_1.ResponseTransformInterceptor,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_1.RolesGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
