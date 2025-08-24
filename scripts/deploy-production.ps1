# TopTable Games Production Deployment Script (PowerShell)
# This script handles the complete production deployment process for Windows

param(
    [Parameter(Position=0)]
    [ValidateSet("deploy", "backup", "health", "cleanup")]
    [string]$Command = "deploy"
)

# Configuration
$ProjectName = "toptable-games"
$DockerComposeFile = "docker-compose.prod.yml"
$BackupDir = "./backups"
$EnvFile = ".env.production"

# Functions
function Write-ColorOutput($Message, $Color = "White") {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Color
}

function Write-Info($Message) {
    Write-ColorOutput "[INFO] $Message" "Cyan"
}

function Write-Success($Message) {
    Write-ColorOutput "[SUCCESS] $Message" "Green"
}

function Write-Warning($Message) {
    Write-ColorOutput "[WARNING] $Message" "Yellow"
}

function Write-Error($Message) {
    Write-ColorOutput "[ERROR] $Message" "Red"
}

function Test-Prerequisites {
    Write-Info "Checking prerequisites..."
    
    # Check if Docker is installed
    try {
        $null = docker --version
        Write-Success "Docker is installed"
    }
    catch {
        Write-Error "Docker is not installed. Please install Docker Desktop first."
        exit 1
    }
    
    # Check if Docker Compose is available
    try {
        $null = docker-compose --version
        Write-Success "Docker Compose is available"
    }
    catch {
        Write-Error "Docker Compose is not available. Please ensure Docker Desktop is running."
        exit 1
    }
    
    # Check if environment file exists
    if (-not (Test-Path $EnvFile)) {
        Write-Error "Production environment file $EnvFile not found."
        Write-Info "Please copy .env.production.template to $EnvFile and configure it."
        exit 1
    }
    
    Write-Success "Prerequisites check passed."
}

function Backup-Database {
    Write-Info "Creating database backup..."
    
    # Create backup directory if it doesn't exist
    if (-not (Test-Path $BackupDir)) {
        New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    }
    
    # Generate backup filename with timestamp
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile = "$BackupDir/toptable_backup_$timestamp.sql"
    
    # Create database backup
    try {
        docker-compose -f $DockerComposeFile exec -T postgres pg_dump -U postgres -d toptable_games | Out-File -FilePath $backupFile -Encoding UTF8
        Write-Success "Database backup created: $backupFile"
    }
    catch {
        Write-Error "Database backup failed: $_"
        exit 1
    }
}

function Build-Application {
    Write-Info "Building application..."
    
    try {
        docker-compose -f $DockerComposeFile build --no-cache
        Write-Success "Application build completed."
    }
    catch {
        Write-Error "Application build failed: $_"
        exit 1
    }
}

function Deploy-Application {
    Write-Info "Deploying application..."
    
    try {
        # Stop existing containers
        docker-compose -f $DockerComposeFile down
        
        # Start services
        docker-compose -f $DockerComposeFile up -d
        
        # Wait for services to be healthy
        Write-Info "Waiting for services to be healthy..."
        Start-Sleep -Seconds 30
        
        # Check service health
        $unhealthyServices = docker-compose -f $DockerComposeFile ps | Select-String "unhealthy"
        if ($unhealthyServices) {
            Write-Error "Some services are unhealthy. Check logs with: docker-compose -f $DockerComposeFile logs"
            exit 1
        }
        
        Write-Success "Application deployed successfully."
    }
    catch {
        Write-Error "Application deployment failed: $_"
        exit 1
    }
}

function Test-Health {
    Write-Info "Running health checks..."
    
    try {
        # Check application health endpoint
        $response = Invoke-WebRequest -Uri "http://localhost/health" -Method GET -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Success "Application health check passed."
        }
        else {
            Write-Error "Application health check failed with status: $($response.StatusCode)"
            exit 1
        }
    }
    catch {
        Write-Error "Application health check failed: $_"
        exit 1
    }
    
    try {
        # Check database connectivity
        $dbCheck = docker-compose -f $DockerComposeFile exec -T postgres pg_isready -U postgres
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Database health check passed."
        }
        else {
            Write-Error "Database health check failed."
            exit 1
        }
    }
    catch {
        Write-Error "Database health check failed: $_"
        exit 1
    }
    
    Write-Success "All health checks passed."
}

function Remove-OldImages {
    Write-Info "Cleaning up old Docker images..."
    
    try {
        # Remove dangling images
        docker image prune -f
        
        # Remove old project images (keep last 3 versions)
        $images = docker images --format "{{.Repository}}:{{.Tag}}" | Where-Object { $_ -like "*$ProjectName*" }
        if ($images.Count -gt 3) {
            $imagesToRemove = $images | Select-Object -Skip 3
            foreach ($image in $imagesToRemove) {
                docker rmi $image -f
            }
        }
        
        Write-Success "Docker cleanup completed."
    }
    catch {
        Write-Warning "Docker cleanup encountered some issues: $_"
    }
}

function Invoke-MainDeployment {
    Write-Info "Starting production deployment for $ProjectName"
    
    # Run deployment steps
    Test-Prerequisites
    Backup-Database
    Build-Application
    Deploy-Application
    Test-Health
    Remove-OldImages
    
    Write-Success "Production deployment completed successfully!"
    Write-Info "Application is now running at:"
    Write-Info "- HTTP: http://localhost"
    Write-Info "- HTTPS: https://localhost"
    Write-Info ""
    Write-Info "To view logs: docker-compose -f $DockerComposeFile logs -f"
    Write-Info "To stop: docker-compose -f $DockerComposeFile down"
}

# Script entry point
switch ($Command) {
    "deploy" {
        Invoke-MainDeployment
    }
    "backup" {
        Test-Prerequisites
        Backup-Database
    }
    "health" {
        Test-Health
    }
    "cleanup" {
        Remove-OldImages
    }
    default {
        Write-Host "Usage: .\deploy-production.ps1 [deploy|backup|health|cleanup]"
        Write-Host ""
        Write-Host "Commands:"
        Write-Host "  deploy  - Full production deployment (default)"
        Write-Host "  backup  - Create database backup only"
        Write-Host "  health  - Run health checks only"
        Write-Host "  cleanup - Clean up old Docker images only"
        exit 1
    }
}
