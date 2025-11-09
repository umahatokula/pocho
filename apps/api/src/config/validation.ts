import * as Joi from 'joi';

const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().uri().required(),
  REDIS_URL: Joi.string().uri().optional(),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_ACCESS_TTL: Joi.number().default(900),
  JWT_REFRESH_TTL: Joi.number().default(604800),
  RATE_LIMIT_TTL: Joi.number().default(60),
  RATE_LIMIT_LIMIT: Joi.number().default(100),
  MEAL_REQUEST_EXPIRY_MINUTES: Joi.number().default(15),
  MEAL_REQUEST_VENDOR_RADIUS_KM: Joi.number().default(5),
  MEILISEARCH_HOST: Joi.string().uri().required(),
  MEILISEARCH_API_KEY: Joi.string().required(),
  PROMETHEUS_METRICS_ENABLED: Joi.boolean().default(true),
});

export default validationSchema;
