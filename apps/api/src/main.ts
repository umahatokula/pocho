import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { Logger as PinoLogger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { setupPrometheus } from './common/observability/prometheus.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const pinoLogger = app.get(PinoLogger);
  app.useLogger(pinoLogger);

  const configService = app.get(ConfigService);
  const globalPrefix = 'v1';
  app.setGlobalPrefix(globalPrefix, { exclude: ['healthz', 'readyz', 'metrics'] });

  app.use(cookieParser());
  app.use(helmet());
  app.use(json({ limit: '1mb' }));
  app.use(urlencoded({ extended: true }));
  app.enableCors({ origin: true, credentials: true });

  app.useGlobalPipes(new ValidationPipe());

  setupPrometheus(app);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Pocho API')
    .setDescription('REST and WebSocket interface for the Pocho marketplace')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get<number>('app.port', 3000);
  await app.listen(port);
  const logger = new Logger('Bootstrap');
  logger.log(`Application is running on port ${port}`);
}

bootstrap();
