# Pocho API

Pocho is a real-time marketplace backend for meal requests, vendor bidding, and delivery orchestration. This repository hosts a production-grade NestJS + Prisma stack targeting PostgreSQL, Redis, and Meilisearch.

## Getting Started

```bash
cp .env.example .env
npm install
npm run prepare
npm run dev
```

To boot supporting services locally:

```bash
docker compose -f apps/api/docker/docker-compose.dev.yml up -d --build
```

### Useful Commands

- `npm run dev` – start the API with hot reload
- `npm run lint` – run ESLint
- `npm run test` – run unit tests
- `npm run test:e2e` – run end-to-end tests
- `npm run db:migrate` – apply Prisma migrations
- `npm run db:seed` – seed the database with sample data

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/SECURITY.md](docs/SECURITY.md) for deeper documentation.
