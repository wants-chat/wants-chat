# Life OS Backend Dockerfile
# Multi-stage build for different environments

# =============================================
# Base stage - Common dependencies
# =============================================
FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy package files
COPY package*.json ./

# =============================================
# Dependencies stage - Install all dependencies
# =============================================
FROM base AS deps

# Install all dependencies (including dev dependencies)
RUN npm ci --only=production && npm cache clean --force

# =============================================
# Build stage - Build the application
# =============================================
FROM base AS build

# Copy all dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# =============================================
# Development stage - For development environment
# =============================================
FROM base AS development

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

# Change ownership to nodejs user
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application in development mode
CMD ["dumb-init", "npm", "run", "start:dev"]

# =============================================
# Production stage - For production environment
# =============================================
FROM base AS production

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy built application from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

# Copy necessary runtime files
COPY --from=build /app/src/database ./src/database

# Change ownership to nodejs user
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application in production mode
CMD ["dumb-init", "node", "dist/main"]