# Multi-stage Docker build for TopTable Games

# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Fix for Rollup optional dependencies issue in Alpine Linux
RUN rm -rf node_modules package-lock.json && npm install

# Build the frontend
RUN npm run build

# Stage 2: Setup the backend with the built frontend
FROM node:20-alpine AS production

# Install PostgreSQL client for database connections
RUN apk add --no-cache postgresql-client

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy server code
COPY server/ ./server/
COPY db/ ./db/

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/dist ./dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose ports
EXPOSE 3000 4050

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4050/api/health || exit 1

# Start the application
CMD ["npm", "start"]
