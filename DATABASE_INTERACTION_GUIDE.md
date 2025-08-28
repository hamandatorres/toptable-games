# 🗄️ TopTable Games - Database Interaction Guide

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Database Setup](#database-setup)
3. [Application Interaction](#application-interaction)
4. [Direct Database Access](#direct-database-access)
5. [API Endpoints](#api-endpoints)
6. [Database Schema](#database-schema)
7. [Development Workflows](#development-workflows)
8. [Backup & Recovery](#backup--recovery)
9. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ installed
- PowerShell or Bash terminal

### Start Everything (3 Commands)

```bash
# 1. Start PostgreSQL database
docker-compose up -d postgres

# 2. Start backend API server
node server/dev-server.js

# 3. Start frontend (in another terminal)
npm run dev
```

**Access Points:**

- 🌐 **Frontend**: http://localhost:3000
- 🔧 **Backend API**: http://localhost:4050
- 📊 **Health Check**: http://localhost:4050/api/health
- 🗄️ **Database**: postgresql://postgres:postgres@localhost:5432/toptable_games

---

## 🛠️ Database Setup

### Initial Setup

```bash
# 1. Clone repository and navigate to project
cd path/to/toptable-games

# 2. Create environment file
Copy-Item ".env.template" ".env.local"

# 3. Start PostgreSQL container
docker-compose up -d postgres

# 4. Initialize database schema and sample data
Get-Content db/seed.sql | docker exec -i toptable-postgres psql -U postgres -d toptable_games
```

### Verify Setup

```bash
# Check container status
docker ps --filter "name=toptable-postgres"

# Verify tables exist
docker exec -it toptable-postgres psql -U postgres -d toptable_games -c "\dt"

# Check sample data
docker exec -it toptable-postgres psql -U postgres -d toptable_games -c "SELECT username FROM users;"
```

**Expected Output:**

```
 username
----------
 User A
 User B
 User C
 User D
```

---

## 🎮 Application Interaction

### Through the Web Interface

#### 1. **User Authentication**

```bash
# Access the application
http://localhost:3000

# Login with sample users
Username: "User A"  # (Development login - no password required)
Username: "User B"
Username: "User C"
Username: "User D"
```

#### 2. **Game Management**

- **Add Games**: Browse and add board games to your collection
- **Rate Games**: Provide 1-5 star ratings
- **Write Reviews**: Add detailed game reviews
- **Track Plays**: Monitor how many times you've played each game

#### 3. **Social Features**

- **Leaderboards**: View top players by play count
- **Community Ratings**: See average ratings across all users
- **User Profiles**: Manage your gaming profile

#### 4. **Virtual Scrolling in Action**

- Large game collections load efficiently
- Smooth 60fps scrolling performance
- Only 6-12 DOM nodes rendered at once (90%+ memory reduction)

---

## 💻 Direct Database Access

### Using Docker Container

```bash
# Connect to PostgreSQL container
docker exec -it toptable-postgres psql -U postgres -d toptable_games

# Alternative: Connect with specific database
docker exec -it toptable-postgres psql -U postgres -d toptable_games
```

### PostgreSQL Commands

```sql
-- Show all tables
\dt

-- Show table structure
\d users
\d user_games

-- Quit psql
\q
```

### Sample Database Queries

```sql
-- View all users
SELECT user_id, username, first_name, last_name, email FROM users;

-- View user game collections
SELECT u.username, ug.game_id, ug.rating, ug.play_count, ug.review
FROM users u
JOIN user_games ug ON u.user_id = ug.user_id;

-- Get average ratings by game
SELECT game_id, AVG(rating) as average_rating, COUNT(*) as total_ratings
FROM user_games
WHERE rating IS NOT NULL
GROUP BY game_id;

-- Find top players by play count
SELECT u.username, SUM(ug.play_count) as total_plays
FROM users u
JOIN user_games ug ON u.user_id = ug.user_id
GROUP BY u.username
ORDER BY total_plays DESC;

-- Games with highest average ratings
SELECT game_id, AVG(rating) as avg_rating, COUNT(rating) as num_ratings
FROM user_games
WHERE rating IS NOT NULL
GROUP BY game_id
HAVING COUNT(rating) >= 2
ORDER BY avg_rating DESC;
```

### Data Manipulation

```sql
-- Add a new user
INSERT INTO users (username, first_name, last_name, email)
VALUES ('newuser', 'John', 'Doe', 'john@example.com');

-- Add a game to user's collection
INSERT INTO user_games (user_id, game_id, play_count, rating, review)
VALUES (1, 'new-game-id', 5, 4, 'Great strategy game!');

-- Update game rating
UPDATE user_games
SET rating = 5, review = 'Amazing game, highly recommend!'
WHERE user_id = 1 AND game_id = 'game-id';

-- Delete a game from collection
DELETE FROM user_games
WHERE user_id = 1 AND game_id = 'game-id';
```

---

## 🔌 API Endpoints

### Authentication

```bash
# Get current user
GET http://localhost:4050/api/auth/user

# Login (development)
POST http://localhost:4050/api/auth/login
Content-Type: application/json
{
  "username": "User A"
}

# Logout
POST http://localhost:4050/api/auth/logout
```

### Game Data

```bash
# Get all game ratings
GET http://localhost:4050/api/game/ratings

# Get user's game collection
GET http://localhost:4050/api/usergames
```

### Social Features

```bash
# Get player leaderboard
GET http://localhost:4050/api/player/leaderboard

# Health check
GET http://localhost:4050/api/health
```

### Using curl Examples

```bash
# Health check
curl http://localhost:4050/api/health

# Login
curl -X POST http://localhost:4050/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "User A"}' \
  -c cookies.txt

# Get user games (with session)
curl http://localhost:4050/api/usergames -b cookies.txt

# Get leaderboard
curl http://localhost:4050/api/player/leaderboard
```

---

## 📊 Database Schema

### Tables Overview

```sql
-- Users table
CREATE TABLE users (
  user_id serial PRIMARY KEY,
  username text,
  first_name text,
  last_name text,
  hash text,                -- Password hash
  email text,
  reset_token text,         -- Password reset token
  reset_expiration date     -- Token expiration
);

-- User games collection
CREATE TABLE user_games (
  id serial PRIMARY KEY,
  user_id int REFERENCES users (user_id),
  game_id text,            -- Board Game Atlas ID
  play_count int,          -- Number of times played
  rating int,              -- 1-5 star rating
  review text              -- User review text
);
```

### Relationships

- **One-to-Many**: Users → User Games
- **Foreign Key**: `user_games.user_id` → `users.user_id`
- **Cascade**: Deleting a user removes their games (if configured)

### Indexes (Recommended)

```sql
-- Add indexes for better performance
CREATE INDEX idx_user_games_user_id ON user_games(user_id);
CREATE INDEX idx_user_games_game_id ON user_games(game_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

---

## 🔄 Development Workflows

### Daily Development

```bash
# 1. Start your day
docker-compose up -d postgres    # Database persists, just ensures it's running
node server/dev-server.js        # Start backend (terminal 1)
npm run dev                      # Start frontend (terminal 2)

# 2. During development
# - Add features to src/
# - Test API endpoints
# - Database changes persist automatically

# 3. End of day
# Just close terminals - Docker container keeps running
# Data is safely stored in persistent volumes
```

### Database Migrations

```bash
# 1. Create migration file
echo "ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT NOW();" > db/migrations/001_add_timestamps.sql

# 2. Apply migration
Get-Content db/migrations/001_add_timestamps.sql | docker exec -i toptable-postgres psql -U postgres -d toptable_games

# 3. Verify changes
docker exec -it toptable-postgres psql -U postgres -d toptable_games -c "\d users"
```

### Testing with Sample Data

```bash
# Reset to clean slate
Get-Content db/seed.sql | docker exec -i toptable-postgres psql -U postgres -d toptable_games

# Add custom test data
docker exec -it toptable-postgres psql -U postgres -d toptable_games -c "
INSERT INTO users (username, first_name, last_name, email)
VALUES ('testuser', 'Test', 'User', 'test@example.com');
"
```

### Environment Management

```bash
# Development
NODE_ENV=development
CONNECTION_STRING=postgresql://postgres:postgres@localhost:5432/toptable_games

# Production (example)
NODE_ENV=production
CONNECTION_STRING=postgresql://prod_user:secure_pass@prod-db:5432/toptable_prod?sslmode=require
```

---

## 💾 Backup & Recovery

### Quick Backup

```bash
# Create SQL dump
docker exec toptable-postgres pg_dump -U postgres toptable_games > backup_$(date +%Y%m%d).sql

# Backup specific table
docker exec toptable-postgres pg_dump -U postgres -t users toptable_games > users_backup.sql
```

### Restore from Backup

```bash
# Restore full database
Get-Content backup_20250827.sql | docker exec -i toptable-postgres psql -U postgres -d toptable_games

# Restore specific table
Get-Content users_backup.sql | docker exec -i toptable-postgres psql -U postgres -d toptable_games
```

### Volume Backup (Advanced)

```bash
# Backup entire PostgreSQL data volume
docker run --rm -v newboardgame_postgres_data:/data -v ${PWD}:/backup alpine tar czf /backup/postgres-volume-backup.tar.gz /data

# Restore volume backup
docker run --rm -v newboardgame_postgres_data:/data -v ${PWD}:/backup alpine tar xzf /backup/postgres-volume-backup.tar.gz -C /
```

### Automated Backup Script

```bash
# Create backup script
cat > backup-database.ps1 << 'EOF'
$date = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "backup_$date.sql"
docker exec toptable-postgres pg_dump -U postgres toptable_games > $backupFile
Write-Host "Database backed up to $backupFile"
EOF

# Run backup
./backup-database.ps1
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. **Database Connection Failed**

```bash
# Check if container is running
docker ps --filter "name=toptable-postgres"

# Start if stopped
docker-compose up -d postgres

# Check logs
docker logs toptable-postgres
```

#### 2. **Tables Don't Exist**

```bash
# Reinitialize database
Get-Content db/seed.sql | docker exec -i toptable-postgres psql -U postgres -d toptable_games

# Verify tables
docker exec -it toptable-postgres psql -U postgres -d toptable_games -c "\dt"
```

#### 3. **Permission Denied**

```bash
# Check PostgreSQL user permissions
docker exec -it toptable-postgres psql -U postgres -c "\du"

# Reset permissions if needed
docker exec -it toptable-postgres psql -U postgres -c "ALTER USER postgres CREATEDB;"
```

#### 4. **Port Already in Use**

```bash
# Check what's using port 5432
netstat -ano | findstr :5432

# Stop conflicting service or change port in docker-compose.yml
ports:
  - "5433:5432"  # Use different host port
```

#### 5. **Data Disappeared**

```bash
# Check if using correct database
docker exec -it toptable-postgres psql -U postgres -l

# Verify volume exists
docker volume ls | findstr postgres

# Check if connected to right container
docker ps --filter "name=postgres"
```

### Performance Issues

```sql
-- Check slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY total_time DESC;

-- Analyze table statistics
ANALYZE users;
ANALYZE user_games;

-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public';
```

### Debug Mode

```bash
# Start with verbose logging
docker-compose up postgres  # Without -d to see logs

# Enable query logging in PostgreSQL
docker exec -it toptable-postgres psql -U postgres -c "ALTER SYSTEM SET log_statement = 'all';"
docker restart toptable-postgres
```

---

## 🔗 Additional Resources

### Documentation Links

- [PostgreSQL Official Docs](https://www.postgresql.org/docs/)
- [Docker Compose Guide](https://docs.docker.com/compose/)
- [Massive.js (ORM) Documentation](https://github.com/dmfay/massive-js)

### Development Tools

- **pgAdmin**: Web-based PostgreSQL administration
- **DBeaver**: Universal database tool
- **VS Code Extensions**: PostgreSQL, SQL tools

### Project Structure

```
├── db/
│   ├── seed.sql                 # Database schema and sample data
│   ├── game/                    # Game-related SQL queries
│   ├── player/                  # Player-related SQL queries
│   ├── user/                    # User management SQL queries
│   └── userGames/               # User game collection queries
├── server/
│   ├── dev-server.js            # Simplified development server
│   ├── index.js                 # Full production server
│   └── controllers/             # API endpoint handlers
└── .env.local                   # Local environment configuration
```

---

## 🎯 Quick Reference

### Essential Commands

```bash
# Start database
docker-compose up -d postgres

# Connect to database
docker exec -it toptable-postgres psql -U postgres -d toptable_games

# Backup database
docker exec toptable-postgres pg_dump -U postgres toptable_games > backup.sql

# Restore database
Get-Content backup.sql | docker exec -i toptable-postgres psql -U postgres -d toptable_games

# View logs
docker logs toptable-postgres

# Stop database
docker-compose stop postgres
```

### Sample Data

- **4 Users**: User A, User B, User C, User D
- **14 Game Records**: Various ratings and play counts
- **Test Login**: Use "User A" as username (development mode)

---

**🎲 Happy Gaming and Database Management!**

For questions or issues, check the troubleshooting section or examine the application logs.
