# 🚀 Production Deployment Guide

This guide covers the complete production deployment process for TopTable Games.

## 📋 Prerequisites

### System Requirements

- **Docker Engine**: 20.10+
- **Docker Compose**: 2.0+
- **Node.js**: 20.19.0+ (for local development)
- **Memory**: 2GB+ available RAM
- **Storage**: 10GB+ available disk space

### Security Requirements

- SSL certificates for HTTPS
- Strong passwords for all services
- Firewall configuration
- Regular security updates

## 🔧 Configuration

### 1. Environment Setup

```bash
# Copy the production environment template
cp .env.production.template .env.production

# Edit the production environment file
nano .env.production
```

#### Critical Environment Variables

```env
# Production Database (Required)
CONNECTION_STRING=postgresql://user:password@host:5432/database
POSTGRES_PASSWORD=your-super-secure-database-password

# Session Security (Required)
SESSION_SECRET=your-256-bit-session-secret

# Redis Security (Required)
REDIS_PASSWORD=your-secure-redis-password

# Domain Configuration (Required)
CORS_ORIGIN=https://yourdomain.com
```

### 2. SSL Certificate Setup

```bash
# Create SSL directory
mkdir -p ssl

# Add your SSL certificates
cp /path/to/your/cert.pem ssl/cert.pem
cp /path/to/your/key.pem ssl/key.pem

# Set proper permissions
chmod 600 ssl/key.pem
chmod 644 ssl/cert.pem
```

### 3. Nginx Configuration

Update the domain in `nginx/conf.d/default.conf`:

```nginx
server_name yourdomain.com www.yourdomain.com;
```

## 🚀 Deployment Process

### Quick Deployment (Recommended)

```bash
# Windows (PowerShell)
.\scripts\deploy-production.ps1

# Linux/macOS
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh
```

### Manual Deployment Steps

#### 1. Build and Deploy

```bash
# Build the application
docker-compose -f docker-compose.prod.yml build

# Deploy with zero-downtime
docker-compose -f docker-compose.prod.yml up -d
```

#### 2. Verify Deployment

```bash
# Check service status
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs app

# Test health endpoints
curl http://localhost/health
```

#### 3. Database Migration

```bash
# Run any pending migrations
docker-compose -f docker-compose.prod.yml exec app npm run migrate
```

## 📊 Monitoring

### Application Monitoring

- **Health Checks**: Available at `/health`
- **Metrics**: Available at `/api/metrics` (Prometheus format)
- **Logs**: Docker logs with structured JSON format

### Infrastructure Monitoring

```bash
# Start monitoring stack
npm run monitoring:start

# Access monitoring tools
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3001 (admin/admin)
```

### Performance Monitoring

```bash
# Run Lighthouse performance tests
npm install -g @lhci/cli
lhci autorun
```

## 🔐 Security

### Security Features Enabled

- **HTTPS Enforcement**: All HTTP traffic redirected to HTTPS
- **Security Headers**: HSTS, CSP, X-Frame-Options, etc.
- **Rate Limiting**: API and authentication endpoints protected
- **Non-root Containers**: All services run as non-privileged users
- **Read-only Filesystems**: Containers use read-only root filesystems
- **Secret Management**: Passwords via environment variables only

### Security Checklist

- [ ] SSL certificates properly configured
- [ ] Strong passwords set for all services
- [ ] Firewall configured (ports 80, 443 only)
- [ ] Regular security updates scheduled
- [ ] Database backups automated
- [ ] Log monitoring configured

## 💾 Backup and Recovery

### Automated Backups

```bash
# Create immediate backup
npm run deploy:backup

# Backup files are stored in ./backups/
```

### Database Backup Schedule

The production setup includes automated daily backups at 2 AM UTC.

### Recovery Process

```bash
# Stop the application
docker-compose -f docker-compose.prod.yml down

# Restore from backup
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -d toptable_games < backups/your-backup-file.sql

# Restart the application
docker-compose -f docker-compose.prod.yml up -d
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

The CI/CD pipeline automatically:

1. **Tests**: Runs all unit and integration tests
2. **Security**: Performs security vulnerability scanning
3. **Build**: Creates optimized Docker images
4. **Performance**: Runs Lighthouse performance tests
5. **Deploy**: Deploys to production (main branch only)

### Manual Triggers

```bash
# Trigger manual deployment
gh workflow run "CI/CD Pipeline"
```

## 📈 Scaling

### Horizontal Scaling

```yaml
# In docker-compose.prod.yml
app:
  deploy:
    replicas: 3
```

### Load Balancing

The Nginx configuration supports multiple app instances automatically.

### Database Scaling

- **Read Replicas**: Configure PostgreSQL read replicas
- **Connection Pooling**: Use PgBouncer for connection management

## 🛠️ Troubleshooting

### Common Issues

#### Application Won't Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs app

# Common causes:
# - Missing environment variables
# - Database connection issues
# - Port conflicts
```

#### Database Connection Issues

```bash
# Check database health
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres

# Test connection
docker-compose -f docker-compose.prod.yml exec app node -e "console.log(process.env.CONNECTION_STRING)"
```

#### SSL Certificate Issues

```bash
# Verify certificates
openssl x509 -in ssl/cert.pem -text -noout

# Check Nginx configuration
docker-compose -f docker-compose.prod.yml exec nginx nginx -t
```

### Performance Issues

```bash
# Monitor resource usage
docker stats

# Check application metrics
curl http://localhost:4050/api/metrics
```

## 📞 Support

### Logs Location

- **Application**: `docker-compose -f docker-compose.prod.yml logs app`
- **Database**: `docker-compose -f docker-compose.prod.yml logs postgres`
- **Nginx**: `docker-compose -f docker-compose.prod.yml logs nginx`

### Health Endpoints

- **Application**: `http://localhost/health`
- **Database**: `docker-compose -f docker-compose.prod.yml exec postgres pg_isready`
- **Redis**: `docker-compose -f docker-compose.prod.yml exec redis redis-cli ping`

### Performance Baselines

After our optimizations, expect:

- **Bundle Size**: ~193KB (59KB gzipped)
- **First Contentful Paint**: <2s
- **Largest Contentful Paint**: <3s
- **Cumulative Layout Shift**: <0.1

## 🔄 Updates

### Application Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and deploy
./scripts/deploy-production.sh
```

### Security Updates

```bash
# Update base images
docker-compose -f docker-compose.prod.yml pull

# Rebuild with updates
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```
