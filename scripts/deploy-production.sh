#!/bin/bash

# TopTable Games Production Deployment Script
# This script handles the complete production deployment process

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="toptable-games"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="./backups"
ENV_FILE=".env.production"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if environment file exists
    if [ ! -f "$ENV_FILE" ]; then
        log_error "Production environment file $ENV_FILE not found."
        log_info "Please copy .env.production.template to $ENV_FILE and configure it."
        exit 1
    fi
    
    log_success "Prerequisites check passed."
}

backup_database() {
    log_info "Creating database backup..."
    
    # Create backup directory if it doesn't exist
    mkdir -p "$BACKUP_DIR"
    
    # Generate backup filename with timestamp
    BACKUP_FILE="$BACKUP_DIR/toptable_backup_$(date +%Y%m%d_%H%M%S).sql"
    
    # Create database backup
    docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T postgres pg_dump -U postgres -d toptable_games > "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        log_success "Database backup created: $BACKUP_FILE"
    else
        log_error "Database backup failed"
        exit 1
    fi
}

build_application() {
    log_info "Building application..."
    
    # Build Docker images
    docker-compose -f "$DOCKER_COMPOSE_FILE" build --no-cache
    
    if [ $? -eq 0 ]; then
        log_success "Application build completed."
    else
        log_error "Application build failed"
        exit 1
    fi
}

deploy_application() {
    log_info "Deploying application..."
    
    # Stop existing containers
    docker-compose -f "$DOCKER_COMPOSE_FILE" down
    
    # Start services
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
    
    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 30
    
    # Check service health
    if docker-compose -f "$DOCKER_COMPOSE_FILE" ps | grep -q "unhealthy"; then
        log_error "Some services are unhealthy. Check logs with: docker-compose -f $DOCKER_COMPOSE_FILE logs"
        exit 1
    fi
    
    log_success "Application deployed successfully."
}

run_health_checks() {
    log_info "Running health checks..."
    
    # Check application health endpoint
    if curl -f http://localhost/health > /dev/null 2>&1; then
        log_success "Application health check passed."
    else
        log_error "Application health check failed."
        exit 1
    fi
    
    # Check database connectivity
    if docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        log_success "Database health check passed."
    else
        log_error "Database health check failed."
        exit 1
    fi
    
    log_success "All health checks passed."
}

cleanup_old_images() {
    log_info "Cleaning up old Docker images..."
    
    # Remove dangling images
    docker image prune -f
    
    # Remove old images (keep last 3 versions)
    docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}" | grep "$PROJECT_NAME" | tail -n +4 | awk '{print $1":"$2}' | xargs -r docker rmi
    
    log_success "Docker cleanup completed."
}

main() {
    log_info "Starting production deployment for $PROJECT_NAME"
    
    # Run deployment steps
    check_prerequisites
    backup_database
    build_application
    deploy_application
    run_health_checks
    cleanup_old_images
    
    log_success "Production deployment completed successfully!"
    log_info "Application is now running at:"
    log_info "- HTTP: http://localhost"
    log_info "- HTTPS: https://localhost"
    log_info ""
    log_info "To view logs: docker-compose -f $DOCKER_COMPOSE_FILE logs -f"
    log_info "To stop: docker-compose -f $DOCKER_COMPOSE_FILE down"
}

# Script entry point
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "backup")
        check_prerequisites
        backup_database
        ;;
    "health")
        run_health_checks
        ;;
    "cleanup")
        cleanup_old_images
        ;;
    *)
        echo "Usage: $0 {deploy|backup|health|cleanup}"
        echo ""
        echo "Commands:"
        echo "  deploy  - Full production deployment (default)"
        echo "  backup  - Create database backup only"
        echo "  health  - Run health checks only"
        echo "  cleanup - Clean up old Docker images only"
        exit 1
        ;;
esac
