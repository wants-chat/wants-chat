# Life OS Backend - NestJS API Server

The backend API server for Life OS, built with NestJS, TypeScript, and Fluxez SDK for comprehensive personal management features.

## 🚀 Features

### Core Modules
- **Authentication**: JWT-based authentication with refresh tokens
- **User Management**: User profiles, preferences, and activity tracking
- **Health & Fitness**: Activity logging, health metrics, nutrition tracking
- **Financial Management**: Account management, expense tracking, budgeting
- **Travel Planning**: Trip planning, itinerary management, document storage
- **Meditation & Mental Health**: Session tracking, mood logging, progress analytics
- **AI Services**: Text/image generation, chat, summarization
- **Notifications**: Real-time notifications and smart reminders
- **WebSocket**: Real-time updates and presence management

### Technical Features
- **TypeScript**: Full type safety and modern JavaScript features
- **OpenAPI**: Comprehensive API documentation with Swagger
- **File Upload**: Multer integration for document and image uploads
- **Validation**: Class-validator for request validation

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Fluxez Account**: For database SDK access

## 🛠️ Installation

### Development Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.production .env

# Configure your .env file with database and API keys

# Run database migrations
npm run migrate

# Start development server
npm run start:dev
```

## 🏗️ Project Structure

```
src/
├── 📂 api/                      # API route handlers
├── 📂 common/                   # Shared utilities and middleware
│   ├── 📂 gateways/            # WebSocket gateways
│   │   ├── app.gateway.ts      # Main WebSocket gateway
│   │   ├── presence.service.ts # User presence management
│   │   └── websocket.module.ts # WebSocket module
│   ├── 📂 decorators/          # Custom decorators
│   ├── 📂 filters/             # Exception filters
│   ├── 📂 guards/              # Route guards
│   ├── 📂 interceptors/        # Request/response interceptors
│   └── 📂 pipes/               # Validation pipes
├── 📂 database/                 # Database configuration
│   └── schema.ts               # Database schema definition
├── 📂 modules/                  # Feature modules
│   ├── 📂 auth/                # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── 📂 dto/             # Data Transfer Objects
│   │   └── 📂 guards/          # Auth guards
│   ├── 📂 users/               # User management
│   ├── 📂 health/              # Health & fitness tracking
│   ├── 📂 fitness/             # Fitness activity logging
│   ├── 📂 finance/             # Financial management
│   ├── 📂 travel/              # Travel planning
│   ├── 📂 meditation/          # Meditation & mental health
│   ├── 📂 ai/                  # AI services
│   ├── 📂 notifications/       # Notification system
│   ├── 📂 fluxez/           # Fluxez SDK wrapper
│   └── 📂 edge-functions/      # Serverless functions
├── 📂 utils/                    # Utility functions
├── app.module.ts               # Main application module
└── main.ts                     # Application entry point
```

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh JWT token
- `GET /auth/profile` - Get current user profile
- `PUT /auth/profile` - Update user profile
- `POST /auth/logout` - Logout user

### Health & Fitness
- `GET /health/profile` - Get health profile
- `PUT /health/profile` - Update health profile
- `POST /health/metrics` - Log health metric
- `GET /health/metrics` - Get health metrics with filtering
- `POST /fitness/activities` - Log fitness activity
- `GET /fitness/activities` - Get fitness activities
- `POST /fitness/workouts` - Create workout plan
- `GET /fitness/analytics` - Get fitness analytics

### Financial Management
- `GET /finance/accounts` - Get financial accounts
- `POST /finance/accounts` - Create financial account
- `POST /finance/expenses` - Add expense transaction
- `GET /finance/expenses` - Get expense history
- `GET /finance/budgets` - Get budgets
- `POST /finance/budgets` - Create budget
- `GET /finance/analytics` - Get financial analytics

### Travel Planning
- `POST /travel/plans` - Create travel plan
- `GET /travel/plans` - Get travel plans with filtering
- `GET /travel/plans/:id` - Get specific travel plan
- `PUT /travel/plans/:id` - Update travel plan
- `DELETE /travel/plans/:id` - Delete travel plan
- `POST /travel/plans/:id/itinerary` - Add itinerary item
- `GET /travel/plans/:id/itinerary` - Get itinerary
- `POST /travel/plans/:id/bookings` - Add booking
- `GET /travel/plans/:id/bookings` - Get bookings
- `GET /travel/plans/:id/budget-summary` - Get budget summary
- `GET /travel/stats` - Get travel statistics

### AI Services
- `POST /ai/chat` - Chat with AI assistant
- `POST /ai/generate/text` - Generate text content
- `POST /ai/generate/image` - Generate images
- `POST /ai/generate/code` - Generate code
- `POST /ai/summarize` - Summarize content
- `POST /ai/translate` - Translate text
- `GET /ai/generations` - Get AI generation history

### Notifications
- `GET /notifications` - Get user notifications
- `PUT /notifications/:id/read` - Mark notification as read
- `DELETE /notifications/:id` - Delete notification
- `POST /notifications/preferences` - Update notification preferences

## 📊 Database Schema

The database schema is defined in `src/database/schema.ts` using Fluxez SDK format:

### Main Tables
- **users**: User accounts and profiles
- **health_profiles**: Health information and medical history
- **fitness_activities**: Exercise and fitness activity logs
- **health_metrics**: Health measurements (weight, BP, etc.)
- **nutrition_logs**: Food and nutrition tracking
- **financial_accounts**: Bank accounts and payment methods
- **expenses**: Financial transactions and expenses
- **budgets**: Budget planning and tracking
- **travel_plans**: Trip planning and management
- **meditation_sessions**: Meditation and mindfulness sessions
- **mental_health_logs**: Daily mood and mental health tracking
- **ai_generations**: AI service usage and history
- **notifications**: User notifications and alerts
- **reminders**: Scheduled reminders and recurring tasks

### Database Commands

```bash
# Run migrations
npm run migrate

# Run migrations (dry run)
npm run migrate:dry

# Development migrations
npm run migrate:dev

# Force migrations (use with caution)
npm run migrate:force

# Sync schema
npm run migrate:sync
```

## 📚 Documentation

### API Documentation
- **Swagger UI**: http://localhost:3001/api-docs

## 🔒 Security

### Authentication
- JWT tokens with configurable expiration
- Refresh token rotation
- Password hashing with bcrypt (12 rounds)
- Rate limiting on auth endpoints

### Data Protection
- Request validation with class-validator
- SQL injection prevention via ORM
- XSS protection with helmet
- CORS configuration
- Input sanitization

### Authorization
- Route-level guards
- Role-based access control
- Resource ownership validation
- API key authentication for services

## 🛠️ Development Tools

### Code Quality
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **TypeScript**: Type checking and modern JavaScript
- **Husky**: Git hooks for quality gates

### Development Scripts
```bash
# Development server with hot reload
npm run start:dev

# Debug mode with inspector
npm run start:debug

# Production build
npm run build

# Format code
npm run format

# Lint code
npm run lint

# Fix linting issues
npm run lint -- --fix
```

## 📈 Performance

### Optimization Strategies
- Compression middleware for responses
- Response pagination for large datasets

### Monitoring
- Health check endpoint: `GET /health`
- Metrics collection with custom interceptors
- Error tracking and logging
- Performance profiling in development

## 🤝 Contributing

1. Follow TypeScript and NestJS best practices
2. Update API documentation for new endpoints
3. Use conventional commit messages

### Code Style
- Use TypeScript strict mode
- Follow NestJS module pattern
- Use DTOs for request/response validation
- Implement proper error handling
- Add JSDoc comments for public methods

---

**Built with NestJS and TypeScript for scalable personal management**# life-os-backend
