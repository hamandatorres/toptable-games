# Strapi Migration Script - PowerShell
# This script populates Strapi CMS with initial game data

Write-Host "🚀 Starting migration to Strapi CMS..." -ForegroundColor Green
Write-Host "⏳ Waiting for Strapi to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

$STRAPI_BASE_URL = "http://localhost:1337/api"

# Function to make API calls
function Invoke-StrapiAPI {
    param(
        [string]$Endpoint,
        [string]$Method = "GET",
        [hashtable]$Data = $null
    )
    
    $uri = "$STRAPI_BASE_URL$Endpoint"
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    try {
        if ($Data -and $Method -ne "GET") {
            $body = $Data | ConvertTo-Json -Depth 10
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers -Body $body
        } else {
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers
        }
        return $response
    } catch {
        Write-Host "⚠️  API Error: $($_.Exception.Message)" -ForegroundColor Yellow
        return $null
    }
}

# Create Mechanics
Write-Host "🔧 Creating game mechanics..." -ForegroundColor Cyan

$mechanics = @(
    "Area Control",
    "Variable Player Powers", 
    "Dice Rolling",
    "Trading",
    "Set Collection",
    "Route Building"
)

foreach ($mechanic in $mechanics) {
    $data = @{
        data = @{
            name = $mechanic
            description = "Game mechanic: $mechanic"
        }
    }
    
    $result = Invoke-StrapiAPI -Endpoint "/mechanics" -Method "POST" -Data $data
    if ($result) {
        Write-Host "✅ Created mechanic: $mechanic" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Mechanic $mechanic might already exist" -ForegroundColor Yellow
    }
}

# Create Categories
Write-Host "🏷️  Creating game categories..." -ForegroundColor Cyan

$categories = @(
    "Strategy",
    "Adventure",
    "Family", 
    "Trains"
)

foreach ($category in $categories) {
    $data = @{
        data = @{
            name = $category
            description = "Game category: $category"
        }
    }
    
    $result = Invoke-StrapiAPI -Endpoint "/categories" -Method "POST" -Data $data
    if ($result) {
        Write-Host "✅ Created category: $category" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Category $category might already exist" -ForegroundColor Yellow
    }
}

# Create Games
Write-Host "🎲 Creating games..." -ForegroundColor Cyan

$games = @(
    @{
        name = "Root"
        description = "Root is a game of adventure and war in which 2 to 4 players battle for control of a vast wilderness."
        year_published = 2018
        min_players = 2
        max_players = 4
        min_age = 13
        avgRating = 4.2
        thumb_url = "https://d2k4q26owzy373.cloudfront.net/350x350/games/uploaded/1540147295104"
    },
    @{
        name = "Catan"
        description = "Catan is a board game for three to four players, designed by Klaus Teuber."
        year_published = 1995
        min_players = 3
        max_players = 4
        min_age = 10
        avgRating = 3.9
        thumb_url = "https://d2k4q26owzy373.cloudfront.net/350x350/games/uploaded/1559254023742"
    },
    @{
        name = "Ticket to Ride"
        description = "Ticket to Ride is a railway-themed German-style board game designed by Alan R. Moon."
        year_published = 2004
        min_players = 2
        max_players = 5
        min_age = 8
        avgRating = 3.9
        thumb_url = "https://d2k4q26owzy373.cloudfront.net/350x350/games/uploaded/1559254202421"
    }
)

foreach ($game in $games) {
    $data = @{
        data = $game
    }
    
    $result = Invoke-StrapiAPI -Endpoint "/games" -Method "POST" -Data $data
    if ($result) {
        Write-Host "✅ Created game: $($game.name)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Game $($game.name) might already exist" -ForegroundColor Yellow
    }
}

Write-Host "🎉 Migration completed successfully!" -ForegroundColor Green
Write-Host "🌐 Visit http://localhost:1337/admin to see your games in the CMS" -ForegroundColor Cyan
