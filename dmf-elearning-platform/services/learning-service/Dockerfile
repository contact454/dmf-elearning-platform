# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including dev for build)
RUN pnpm install --no-frozen-lockfile

# Generate Prisma Client BEFORE build
RUN npx prisma generate

# Copy source
COPY . .

# Build TypeScript
RUN pnpm run build

# Production stage — single stage to keep Prisma happy
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy everything from builder (simplest for pnpm + Prisma)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

# Expose port
EXPOSE 3004

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
    CMD wget -qO- http://localhost:3004/health || exit 1

# Start server
CMD ["node", "dist/index.js"]
