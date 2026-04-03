# Life OS Frontend Dockerfile
# Multi-stage build for different environments

# =============================================
# Base stage - Common setup
# =============================================
FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache dumb-init curl && \
    rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S reactjs -u 1001

# =============================================
# Dependencies stage - Install dependencies
# =============================================
FROM base AS deps

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# =============================================
# Development stage - For development environment
# =============================================
FROM base AS development

# Install all dependencies (including dev)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Change ownership to nodejs user
RUN chown -R reactjs:nodejs /app
USER reactjs

# Expose Vite dev server port
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5173 || exit 1

# Start development server
CMD ["dumb-init", "npm", "run", "dev", "--", "--host", "0.0.0.0"]

# =============================================
# Build stage - Build the application
# =============================================
FROM base AS build

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
ARG VITE_API_URL=http://localhost:3000
ARG VITE_WS_URL=ws://localhost:3000
ARG VITE_APP_NAME="Life OS"
ARG VITE_ENVIRONMENT=production

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_ENVIRONMENT=$VITE_ENVIRONMENT

RUN npm run build

# =============================================
# Production stage - Serve with nginx
# =============================================
FROM nginx:alpine AS production

# Copy built application from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create non-root user
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S nginx-user -u 1001 -G nginx-user

# Set proper permissions
RUN chown -R nginx-user:nginx-user /usr/share/nginx/html && \
    chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx && \
    chown -R nginx-user:nginx-user /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx-user:nginx-user /var/run/nginx.pid

# Switch to non-root user
USER nginx-user

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]