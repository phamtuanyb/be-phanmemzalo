# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files + lock file
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source + build
COPY . .
RUN npm run build

# ─── Stage 2: Production ─────────────────────────────────────────────────────
FROM node:20-alpine

# netcat dùng cho entrypoint wait postgres; ts-node để chạy seed/migration
RUN apk add --no-cache netcat-openbsd

WORKDIR /app

COPY package.json package-lock.json* ./

# Install cả deps (cần ts-node, typeorm CLI để chạy migration + seed)
RUN npm ci

# Copy built code + source seed (seed.ts vẫn cần ts-node để chạy)
COPY --from=builder /app/dist ./dist
COPY src ./src
COPY tsconfig.json ./

# Folder uploads (bind volume từ ngoài vào)
RUN mkdir -p uploads

# Entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3001
ENTRYPOINT ["docker-entrypoint.sh"]
