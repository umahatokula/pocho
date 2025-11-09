FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages ./packages
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build -w @pocho/api

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=base /app/apps/api/dist ./apps/api/dist
COPY --from=base /app/package.json ./
COPY --from=base /app/apps/api/package.json ./apps/api/
ENV NODE_ENV=production
CMD ["node", "apps/api/dist/main.js"]
