# Architecture Overview

The Pocho platform is designed around a modular NestJS application hosted in `apps/api`. Each domain feature lives in its own module beneath `src/modules`, backed by a shared Prisma ORM layer and Redis-powered queues.

## Key Components

- **API Gateway**: REST and WebSocket endpoints exposed via NestJS with global validation, logging, and observability.
- **Prisma ORM**: PostgreSQL database with generated client, migrations, and seed data.
- **Redis**: Caching, BullMQ queues, WebSocket scaling, and distributed rate limits.
- **Meilisearch**: Full-text search for vendors and menus.
- **BullMQ Workers**: Background processing for notifications, SLA checks, and synchronization tasks.
- **Observability**: Pino logger, Prometheus metrics, health/readiness probes.

## Module Breakdown

- `auth`: JWT authentication, refresh tokens, verification, and 2FA hooks.
- `users`: Core user management and profile data.
- `vendors`, `menus`: Vendor onboarding and menu management with Meilisearch sync.
- `meal-requests`, `offers`: Real-time negotiation flow with WebSocket broadcast.
- `orders`, `order-events`, `riders`: Fulfilment, rider assignment, and live tracking.
- `payments`: Paystack/Flutterwave integration with webhook verification.
- `notifications`: Push and SMS delivery with templating.
- `analytics`: Aggregated metrics exposed through secured endpoints.
- `websocket-gateway`: Centralized socket namespaces, auth, and presence tracking.

Shared infrastructure such as interceptors, guards, filters, and decorators lives under `src/common`.

## Data Flow

1. Customers submit meal requests with budget constraints.
2. Vendors receive notifications in real-time via WebSockets and push.
3. Offers are placed and negotiated. Accepting an offer triggers order creation.
4. Orders progress through status events, assigning riders and tracking delivery.
5. Payments are initiated via Paystack/Flutterwave; webhooks finalize state.
6. Notifications and analytics workers react to lifecycle events.

## Extensibility

AI-focused modules under `ai/` provide typed HTTP clients and feature flags for external ML services. Modules communicate through NestJS events and BullMQ queues, keeping boundaries explicit for future scaling into microservices if needed.
