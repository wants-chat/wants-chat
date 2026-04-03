# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Open-source repository setup (LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY)
- Docker Compose for local development and production
- Comprehensive documentation (architecture, self-hosting, environment variables, tool development)
- GitHub issue and PR templates
- EditorConfig for consistent formatting
- Makefile with developer convenience commands
- Monorepo workspace configuration (npm workspaces)

### Changed
- Updated README for open-source audience with self-hosting guide
- Improved .gitignore to prevent accidental secret commits
- Removed hardcoded analytics IDs from source code
- Cleaned up .env.example files (removed real credentials)

### Security
- Removed tracked .env.production and .env.local files from git
- Sanitized .env.example files to use placeholder values only

## [1.0.0] - 2026-04-01

### Added
- 1100+ contextual tool components
- Multi-model AI chat (30+ models via OpenRouter)
- AI image generation (FLUX, SDXL via Runware)
- AI video generation
- No-code app builder
- Real-time chat with WebSocket support
- JWT authentication with OAuth (Google, GitHub, Apple)
- Stripe billing integration
- Mobile apps (iOS + Android) built with Flutter
- Internationalization (English, Japanese)
- Dark/Light theme
- Export functionality (PDF, Excel, CSV, JSON)
- Organization/team support
- Vector search for tools (Qdrant)
