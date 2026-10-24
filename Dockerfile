# One image: the NestJS API also serves the built React app (no nginx).

# ---------- 1. Build the React frontend ----------
FROM node:22-slim AS web-build
WORKDIR /web
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
# Same-origin API in production
ENV VITE_API_URL=
RUN npm run build

# ---------- 2. Build the NestJS backend ----------
FROM node:22-slim AS api-build
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/ ./
# Generate the Prisma client before compiling; regenerate after pruning dev deps
RUN npx prisma generate \
 && npm run build \
 && npm prune --omit=dev \
 && npx prisma generate

# ---------- 3. Runtime ----------
FROM node:22-slim AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production \
    PORT=3000 \
    CLIENT_DIR=/app/client
WORKDIR /app

COPY --from=api-build --chown=node:node /app/package.json ./
COPY --from=api-build --chown=node:node /app/node_modules ./node_modules
COPY --from=api-build --chown=node:node /app/dist ./dist
COPY --from=api-build --chown=node:node /app/prisma ./prisma
COPY --from=api-build --chown=node:node /app/docker-entrypoint.sh ./
COPY --from=web-build --chown=node:node /web/dist ./client

USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=5 \
  CMD node -e "fetch('http://localhost:'+process.env.PORT+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["sh", "./docker-entrypoint.sh"]
