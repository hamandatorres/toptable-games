# Multi-stage Docker build for TopTable Games

# Stage 1: Build the React frontend
FROM node:22-bullseye-slim AS frontend-builder
WORKDIR /app

# Update and upgrade packages for security
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y --no-install-recommends dumb-init && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Create non-root user early for security
RUN groupadd --gid 1001 --system nodejs && \
    useradd --uid 1001 --system --gid nodejs --shell /bin/bash --create-home nodejs

# Change ownership and switch to non-root user for npm install
RUN chown -R nodejs:nodejs /app
USER nodejs

RUN npm ci --only=production

# Copy source code
COPY --chown=nodejs:nodejs . .

# Switch back to root to fix permissions and install dependencies
USER root
# Fix for Rollup optional dependencies issue in Alpine Linux
RUN rm -rf node_modules package-lock.json
USER nodejs
RUN npm install

# Build the frontend
RUN npm run build

# Stage 2: Setup the backend with the built frontend
FROM node:22-bullseye-slim AS production

# Update and upgrade packages for security
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
    postgresql-client \
    dumb-init \
    curl && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Create non-root user for security
RUN groupadd --gid 1001 --system nodejs && \
    useradd --uid 1001 --system --gid nodejs --shell /bin/bash --create-home nodejs

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy server code and change ownership
COPY --chown=nodejs:nodejs server/ ./server/
COPY --chown=nodejs:nodejs db/ ./db/

# Copy built frontend from previous stage
COPY --from=frontend-builder --chown=nodejs:nodejs /app/dist ./dist

# Change ownership of the entire app directory
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose ports
EXPOSE 3000 4050

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4050/api/health || exit 1

# Start the application with dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
