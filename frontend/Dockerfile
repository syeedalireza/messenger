# ===================================
# Messenger Frontend - Multi-stage Dockerfile
# ===================================

# ===================
# Base Stage
# ===================
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat

# ===================
# Dependencies Stage
# ===================
FROM base AS deps
COPY package*.json ./

# Install all dependencies
RUN npm install

# ===================
# Development Stage
# ===================
FROM base AS development
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Development command with hot reload
CMD ["npm", "run", "dev"]

# ===================
# Build Stage
# ===================
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# ===================
# Production Stage
# ===================
FROM base AS production
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Production command
CMD ["node", "server.js"]
<!-- frontend docker -->
