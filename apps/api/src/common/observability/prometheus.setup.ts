import { INestApplication } from '@nestjs/common';
import { collectDefaultMetrics, register } from 'prom-client';

let initialized = false;

export const setupPrometheus = (app: INestApplication) => {
  if (initialized) {
    return;
  }
  initialized = true;

  app.use('/metrics', async (_req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });

  collectDefaultMetrics();
};
