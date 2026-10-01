# syntax=docker/dockerfile:1

FROM node:24-bookworm-slim AS base

ENV NODE_ENV=production \
    PORT=4000 \
    DB_PATH=/data/sahi.db

WORKDIR /app

RUN mkdir -p /data && chown node:node /data

HEALTHCHECK --interval=10s --timeout=3s --start-period=15s --retries=5 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:4000/api/health').then(r => { if (!r.ok) process.exit(1); }).catch(() => process.exit(1));"]

FROM node:24-bookworm-slim AS dependencies

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM base AS development

ENV NODE_ENV=development

COPY --from=dependencies /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node src ./src
COPY --chown=node:node seed ./seed
COPY --chown=node:node admin ./admin

USER node
CMD ["node", "--watch", "src/server.js"]

FROM base AS production

COPY --from=dependencies /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node src ./src
COPY --chown=node:node seed ./seed
COPY --chown=node:node admin ./admin

USER node
EXPOSE 4000
CMD ["node", "src/server.js"]
