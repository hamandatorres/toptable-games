# 🎲 TopTable Games

> A modern board game tracking and review platform built with React, TypeScript, and Node.js

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com)
[![Docker](https://img.shields.io/badge/docker-enabled-blue)](https://docker.com)
[![SCSS](https://img.shields.io/badge/scss-modernized-purple)](https://sass-lang.com)
[![React](https://img.shields.io/badge/react-19.1.1-blue)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/typescript-ready-blue)](https://typescriptlang.org)

## 🎯 Project Overview

TopTable Games is a full-stack web application designed for board game enthusiasts to discover, track, and review their favorite games. Users can maintain personal game libraries, log play sessions, write reviews, and compete on leaderboards.

### ✨ Key Features

- 🎮 **Game Library Management** - Add, organize, and track your board game collection
- 📊 **Play Statistics** - Monitor play counts, ratings, and gaming trends
- ✍️ **Reviews & Ratings** - Share detailed reviews and rate games
- 🏆 **Leaderboards** - Compete with other players and track achievements
- 👤 **User Profiles** - Customize your gaming persona and preferences
- 🔍 **Game Discovery** - Find new games based on preferences and reviews

## 🛠 Tech Stack

### Frontend

- **React 19.1.1** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Vite 7.1.3** - Lightning-fast build tool
- **Modern SCSS** - Fully modernized with @use/@forward syntax
- **Redux Toolkit** - State management

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe server development

### Database & Cache

- **PostgreSQL 15** - Primary database
- **Redis 7** - Session storage and caching

### DevOps

- **Docker & Docker Compose** - Containerization
- **Docker Compose Watch** - Live development reloading
- **Multi-stage builds** - Optimized production images

## 🚀 Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running
- [Git](https://git-scm.com/) for version control
- [VS Code](https://code.visualstudio.com/) (recommended)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd newboardgame
   ```

2. **Environment Setup**

   ```bash
   # Copy environment template (if exists)
   cp .env.example .env
   ```

3. **Start with Docker Compose**

   ```bash
   # Build and start all services
   docker compose up --build

   # Or use watch mode for development
   docker compose watch
   ```

4. **Access the application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:4050
   - **Database**: localhost:5432 (PostgreSQL)
   - **Cache**: localhost:6379 (Redis)

## 🔧 Development

### Development with Watch Mode

Docker Compose Watch provides automatic file synchronization:

```bash
# Start with automatic file watching
docker compose watch

# Your changes in ./src, ./server, etc. will be automatically synced
# Package.json changes trigger rebuilds
```

### Manual Development Commands

```bash
# View running containers
docker compose ps

# View logs
docker compose logs -f
docker compose logs -f frontend
docker compose logs -f backend

# Rebuild specific services
docker compose build frontend
docker compose build backend

# Stop all services
docker compose down

# Clean rebuild (if needed)
docker compose down
docker system prune -f
docker compose up --build --no-cache
```

### Database Operations

```bash
# Connect to PostgreSQL
docker compose exec postgres psql -U postgres -d toptable_games

# View database logs
docker compose logs -f postgres
```

## 📁 Project Structure

```
newboardgame/
├── 📄 docker-compose.yml          # Container orchestration with watch mode
├── 📄 Dockerfile                  # Backend production container
├── 📄 Dockerfile.dev              # Frontend development container
├── 📄 package.json                # Node.js dependencies & scripts
├── 📄 tsconfig.json              # TypeScript configuration
├── 📄 vite.config.ts             # Vite build configuration
├── 📁 public/                     # Static assets
├── 📁 src/                        # React application source
│   ├── 📁 components/            # Reusable React components
│   ├── 📁 redux/                 # State management
│   ├── 📁 scss/                  # ✅ Modernized SCSS architecture
│   │   ├── 📁 1-helpers/         # Variables, mixins, functions
│   │   ├── 📁 2-basics/          # Base styles, resets
│   │   ├── 📁 3-containers/      # Component styles
│   │   ├── 📁 4-pages/           # Page-specific styles
│   │   └── 📄 main.scss          # Main SCSS entry point
│   └── 📄 App.tsx                # Main React component
├── 📁 server/                     # Express.js backend
│   ├── 📁 controllers/           # API route handlers
│   ├── 📁 middleware/            # Custom middleware
│   └── 📄 index.js              # Server entry point
└── 📁 db/                        # Database files
    ├── 📄 seed.sql              # Database seeding
    └── 📁 */                    # Organized SQL queries
```

## 🎨 SCSS Architecture

The project features a **fully modernized SCSS architecture** using the latest @use/@forward syntax:

### ✅ **Modernization Complete**

- ❌ **Before**: Deprecated `@import` syntax (removed in Dart Sass 3.0.0)
- ✅ **After**: Modern `@use` and `@forward` syntax
- 🚀 **Performance**: Improved from 19-21 modules to **101+ modules transformed**

### Architecture Pattern

```scss
// Modern SCSS pattern used throughout
@use "../1-helpers/variables" as *;
@use "../1-helpers/mixins" as *;

.component {
	color: $primary-color;
	@include border();
}
```

For detailed SCSS modernization information, see [`SCSS_MODERNIZATION_GUIDE.md`](./SCSS_MODERNIZATION_GUIDE.md).

## 🐳 Docker Configuration

### Services

- **`frontend`** - React development server (Port 3000)
- **`backend`** - Node.js API server (Port 4050)
- **`postgres`** - PostgreSQL database (Port 5432)
- **`redis`** - Redis cache (Port 6379)

### Watch Mode Features

- **Automatic sync** for source code changes
- **Smart rebuilds** for dependency changes
- **Hot reload** for both frontend and backend
- **Optimized ignores** for test files and node_modules

## 🧪 Testing & Quality

```bash
# Run tests (when implemented)
npm test

# Type checking
npm run type-check

# Linting
npm run lint

# SCSS compilation check
npm run build
```

## 📊 Current Status

### ✅ **Completed**

- [x] **SCSS Modernization** - 100% complete with modern @use/@forward syntax
- [x] **Docker Configuration** - Multi-service setup with watch mode
- [x] **Build System** - Vite + TypeScript + modern tooling
- [x] **Project Structure** - Organized and scalable architecture
- [x] **Development Environment** - Fully containerized with hot reload

### 🔄 **In Progress**

- [ ] **Service Integration** - Frontend/backend communication
- [ ] **Database Setup** - Schema and initial data
- [ ] **Authentication** - User login and registration
- [ ] **API Development** - Core game management endpoints

### 🎯 **Next Steps**

1. **Database initialization** and schema setup
2. **API endpoint development** and testing
3. **Frontend component development**
4. **User authentication implementation**
5. **Game library functionality**
6. **Review and rating system**

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Follow the development setup** above
4. **Make your changes** using the Docker watch mode
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

### Development Guidelines

- Use the modernized SCSS architecture patterns
- Follow TypeScript best practices
- Test your changes with Docker Compose
- Update documentation as needed

## 📝 Documentation

- **[SCSS Modernization Guide](./SCSS_MODERNIZATION_GUIDE.md)** - Complete modernization documentation
- **[API Documentation](./docs/api.md)** - Backend API reference (when available)
- **[Component Guide](./docs/components.md)** - Frontend component documentation (when available)

## 🛟 Troubleshooting

### Common Issues

**Build Failures**

```bash
# Clean rebuild
docker compose down
docker system prune -f
docker compose up --build --no-cache
```

**Port Conflicts**

```bash
# Check port usage
netstat -an | findstr "3000\|4050\|5432\|6379"
```

**SCSS Compilation Errors**

- Ensure all files using variables have `@use '../1-helpers/variables' as *;`
- Ensure all files using mixins have `@use '../1-helpers/mixins' as *;`
- Check file path depth for correct `../` count

For detailed troubleshooting, see [`SCSS_MODERNIZATION_GUIDE.md`](./SCSS_MODERNIZATION_GUIDE.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Vision

TopTable Games aims to become the premier platform for board game enthusiasts to track, discover, and share their gaming experiences. With modern web technologies and a focus on user experience, we're building a community-driven platform that celebrates the joy of tabletop gaming.

---

**Built with ❤️ for the board gaming community**

_Last Updated: August 23, 2025_
