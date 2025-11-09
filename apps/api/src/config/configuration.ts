type RedisConfig = {
  host: string;
  port: number;
  password?: string;
  username?: string;
  tls?: boolean;
};

type RateLimitConfig = {
  ttl: number;
  limit: number;
};

type AuthConfig = {
  accessSecret: string;
  refreshSecret: string;
  accessTtl: number;
  refreshTtl: number;
};

type FeatureFlagsConfig = {
  autoBid: boolean;
  aiRecommendations: boolean;
  aiEta: boolean;
};

type MetricsConfig = {
  enabled: boolean;
};

type SearchConfig = {
  host: string;
  apiKey: string;
};

type StorageConfig = {
  bucket: string;
  endpoint?: string;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
};

type PaymentConfig = {
  paystack: {
    secretKey: string;
    publicKey: string;
    webhookSecret: string;
  };
  flutterwave: {
    secretKey: string;
    publicKey: string;
    webhookSecret: string;
  };
};

type MealRequestConfig = {
  defaultExpiryMinutes: number;
  vendorRadiusKm: number;
};

const configuration = () => ({
  app: {
    port: parseInt(process.env.PORT ?? '3000', 10),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    logLevel: process.env.LOG_LEVEL ?? 'info',
  },
  database: {
    url: process.env.DATABASE_URL ?? 'postgresql://localhost:5432/pocho',
  },
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD,
    username: process.env.REDIS_USERNAME,
    tls: process.env.REDIS_TLS === 'true',
  } satisfies RedisConfig,
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL ?? '60', 10),
    limit: parseInt(process.env.RATE_LIMIT_LIMIT ?? '100', 10),
  } satisfies RateLimitConfig,
  auth: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? 'secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'secret',
    accessTtl: parseInt(process.env.JWT_ACCESS_TTL ?? '900', 10),
    refreshTtl: parseInt(process.env.JWT_REFRESH_TTL ?? '604800', 10),
  } satisfies AuthConfig,
  features: {
    autoBid: process.env.FEATURE_AUTO_BID === 'true',
    aiRecommendations: process.env.FEATURE_AI_RECOMMENDATIONS === 'true',
    aiEta: process.env.FEATURE_AI_ETA === 'true',
  } satisfies FeatureFlagsConfig,
  metrics: {
    enabled: process.env.PROMETHEUS_METRICS_ENABLED !== 'false',
  } satisfies MetricsConfig,
  mealRequests: {
    defaultExpiryMinutes: parseInt(process.env.MEAL_REQUEST_EXPIRY_MINUTES ?? '15', 10),
    vendorRadiusKm: parseInt(process.env.MEAL_REQUEST_VENDOR_RADIUS_KM ?? '5', 10),
  } satisfies MealRequestConfig,
  search: {
    host: process.env.MEILISEARCH_HOST ?? 'http://localhost:7700',
    apiKey: process.env.MEILISEARCH_API_KEY ?? 'masterKey',
  } satisfies SearchConfig,
  storage: {
    bucket: process.env.S3_BUCKET ?? '',
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION,
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  } satisfies StorageConfig,
  payments: {
    paystack: {
      secretKey: process.env.PAYSTACK_SECRET_KEY ?? '',
      publicKey: process.env.PAYSTACK_PUBLIC_KEY ?? '',
      webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET ?? '',
    },
    flutterwave: {
      secretKey: process.env.FLUTTERWAVE_SECRET_KEY ?? '',
      publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY ?? '',
      webhookSecret: process.env.FLUTTERWAVE_WEBHOOK_SECRET ?? '',
    },
  } satisfies PaymentConfig,
  internalApiKey: process.env.INTERNAL_API_KEY ?? '',
  ai: {
    recommendations: {
      url: process.env.AI_RECOMMENDATIONS_URL,
      key: process.env.AI_RECOMMENDATIONS_KEY,
    },
    autoBid: {
      url: process.env.AI_AUTOBID_URL,
      key: process.env.AI_AUTOBID_KEY,
    },
    eta: {
      url: process.env.AI_ETA_URL,
      key: process.env.AI_ETA_KEY,
    },
  },
});

export type AppConfiguration = ReturnType<typeof configuration>;
export type ConfigKeys = keyof AppConfiguration;

export default configuration;
