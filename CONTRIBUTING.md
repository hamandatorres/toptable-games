# Contributing to TopTable Games

Thank you for your interest in contributing to TopTable Games! This document provides guidelines and instructions for contributing.

## Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/hamandatorres/toptable-games.git
   cd toptable-games
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Start development environment**
   ```bash
   docker-compose up -d  # Start PostgreSQL
   npm run dev          # Start development server
   ```

## Code Standards

- **TypeScript**: All new code should be written in TypeScript
- **SCSS**: Use the modernized SCSS architecture with @use/@forward
- **React**: Follow React 19 best practices and hooks patterns
- **No inline styles**: Use CSS classes instead of inline styles
- **ESLint**: Code must pass linting (`npm run lint`)

## Pull Request Process

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**

   - Write tests for new functionality
   - Follow the existing code style
   - Update documentation if needed

3. **Test your changes**

   ```bash
   npm run lint     # Check code style
   npm run build    # Ensure it builds
   npm test         # Run tests (when available)
   ```

4. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Commit Message Format

Use conventional commits:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for code style changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

## Architecture Overview

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Express.js + PostgreSQL
- **Styling**: SCSS with modern architecture
- **Docker**: Multi-stage builds with development watch mode
- **Database**: PostgreSQL with organized SQL queries

## Getting Help

- Check existing issues before creating new ones
- Use descriptive titles and provide detailed information
- Include steps to reproduce for bugs
- Add screenshots when helpful

Thank you for contributing! 🎲
