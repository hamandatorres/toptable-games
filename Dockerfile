# Multi-stage Docker build for TopTable Games - Production Optimized

# Stage 1: Build the React frontend
FROM node:22-alpine AS frontend-builder

# Install security updates and required packages
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init curl

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./

# Install dependencies as root, then change ownership
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# Copy source code and change ownership
COPY --chown=nodejs:nodejs . .

# Install all dependencies for build (including dev dependencies)
RUN npm install --ignore-scripts

# Switch to non-root user for build
USER nodejs

# Build the frontend with optimizations
ENV NODE_ENV=production
RUN npm run build

# Stage 2: Setup the backend with the built frontend
FROM node:22-alpine AS production

# Install security updates and runtime dependencies
RUN apk update && apk upgrade && \
    apk add --no-cache \
    postgresql15-client \
    dumb-init \
    curl \
    tini && \
    rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force --silent

# Copy server code
COPY --chown=nodejs:nodejs server/ ./server/
COPY --chown=nodejs:nodejs db/ ./db/

# Copy built frontend from previous stage
COPY --from=frontend-builder --chown=nodejs:nodejs /app/dist ./dist

# Create logs directory
RUN mkdir -p /app/logs && chown nodejs:nodejs /app/logs

# Switch to non-root user
USER nodejs

# Set production environment
ENV NODE_ENV=production
ENV SERVER_PORT=4050

# Expose port
EXPOSE 4050

# Add labels for better container management
LABEL maintainer="TopTable Games" \
      version="1.0.0" \
      description="TopTable Games - Board Game Collection Tracker" \
      org.opencontainers.image.source="https://github.com/yourusername/toptable-games"

# Health check with better configuration
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:4050/api/health || exit 1

# Use tini as init system for proper signal handling
ENTRYPOINT ["tini", "--"]
CMD ["npm", "start"]
