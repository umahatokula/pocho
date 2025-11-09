"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const express_1 = require("express");
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const nestjs_pino_1 = require("nestjs-pino");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
const validation_pipe_1 = require("./common/pipes/validation.pipe");
const prometheus_setup_1 = require("./common/observability/prometheus.setup");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bufferLogs: true,
    });
    const pinoLogger = app.get(nestjs_pino_1.Logger);
    app.useLogger(pinoLogger);
    const configService = app.get(config_1.ConfigService);
    const globalPrefix = 'v1';
    app.setGlobalPrefix(globalPrefix, { exclude: ['healthz', 'readyz', 'metrics'] });
    app.use((0, cookie_parser_1.default)());
    app.use((0, helmet_1.default)());
    app.use((0, express_1.json)({ limit: '1mb' }));
    app.use((0, express_1.urlencoded)({ extended: true }));
    app.enableCors({ origin: true, credentials: true });
    app.useGlobalPipes(new validation_pipe_1.ValidationPipe());
    (0, prometheus_setup_1.setupPrometheus)(app);
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('Pocho API')
        .setDescription('REST and WebSocket interface for the Pocho marketplace')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('docs', app, document);
    const port = configService.get('app.port', 3000);
    await app.listen(port);
    const logger = new common_1.Logger('Bootstrap');
    logger.log(`Application is running on port ${port}`);
}
bootstrap();
