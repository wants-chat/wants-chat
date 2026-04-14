# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                  │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│   Web App    │  Mobile App  │  Extension   │    API Clients     │
│  (React 18)  │  (Flutter)   │  (Chrome)    │                    │
└──────┬───────┴──────┬───────┴──────┬───────┴────────┬───────────┘
       │              │              │                │
       └──────────────┴──────────────┴────────────────┘
                              │
                    ┌─────────┴──────────┐
                    │    NestJS Backend   │
                    │    (REST + WS)      │
                    ├────────────────────┤
                    │  Auth Module       │ JWT, OAuth (Google, GitHub, Apple)
                    │  Chat Module       │ Real-time messaging, AI streaming
                    │  AI Module         │ Multi-provider LLM routing
                    │  Storage Module    │ File uploads (Cloudflare R2)
                    │  Research Module   │ Web research, autonomous tasks
                    │  App Builder       │ No-code app generation
                    │  + 36 more modules │
                    └─────┬────────┬─────┘
                          │        │
              ┌───────────┤        ├───────────┐
              │           │        │           │
        ┌─────┴──┐  ┌────┴───┐  ┌┴────┐  ┌───┴─────┐
        │Postgres│  │ Redis  │  │Qdrant│  │   R2    │
        │  (DB)  │  │(Cache) │  │(Vec) │  │(Storage)│
        └────────┘  └────────┘  └──────┘  └─────────┘
```

## How Intent-Driven UI Works

The core innovation of Wants AI is the intent-to-UI pipeline:

```
1. User Input       "I want to convert 500 USD to EUR"
       │
2. AI Processing    Intent detected: currency_conversion
       │                Entities: {amount: 500, from: USD, to: EUR}
       │
3. Tool Selection   Maps intent → CurrencyConverterTool component
       │
4. UI Rendering     Renders interactive currency converter
       │                with pre-filled values from entities
       │
5. User Interaction  User interacts with the rendered UI
       │                (modify values, export results, etc.)
       │
6. Data Sync        Tool data optionally synced to backend
```

## Key Directories

```
wants/
├── frontend/              # React 18 + TypeScript web application
│   ├── src/
│   │   ├── components/
│   │   │   ├── tools/     # 1100+ tool components (the core of the platform)
│   │   │   ├── chat/      # Chat interface components
│   │   │   ├── landing/   # Landing page sections
│   │   │   ├── oss/       # Open-source landing page sections
│   │   │   └── ui/        # shadcn/ui base components
│   │   ├── pages/         # Route pages
│   │   ├── contexts/      # React context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service layer
│   │   ├── i18n/          # Internationalization (17 locales)
│   │   └── lib/           # Utilities and API client
│   └── public/            # Static assets
│
├── backend/               # NestJS REST + WebSocket server
│   ├── src/
│   │   ├── modules/       # NestJS feature modules (46 controllers, 90 services)
│   │   │   ├── auth/      # JWT + OAuth authentication
│   │   │   ├── chat/      # Chat and AI conversation
│   │   │   ├── ai/        # AI service (multi-provider)
│   │   │   ├── database/  # PostgreSQL connection + query builder
│   │   │   └── ...        # 36+ more modules
│   │   ├── common/        # Guards, interceptors, decorators
│   │   └── data/          # Tool registry
│   └── migrations/        # Database migrations
│
├── mobile/                # Flutter mobile app (iOS + Android)
│   ├── lib/
│   │   ├── screens/       # App screens
│   │   ├── providers/     # Riverpod state management
│   │   ├── services/      # API and platform services
│   │   └── models/        # Data models
│   └── pubspec.yaml       # Dart dependencies
│
├── apps/                  # 135+ app templates (separate repo)
├── extension/             # Browser extension
├── scripts/               # Build and deployment scripts
└── docs/                  # Documentation
```

## Database

The backend uses **raw PostgreSQL** queries via the `pg` library with a custom query builder, not an ORM like Prisma or TypeORM. This was chosen for:

- **Performance**: Direct SQL with no abstraction overhead
- **Control**: Full control over query optimization
- **Simplicity**: No migration framework complexity for schema changes

All queries use parameterized placeholders (`$1, $2`) to prevent SQL injection.

## Authentication Flow

```
Client                    Backend                    Database
  │                         │                           │
  ├── POST /auth/login ────>│                           │
  │   {email, password}     ├── Verify credentials ────>│
  │                         │<── User record ───────────┤
  │                         ├── Generate JWT tokens     │
  │<── {accessToken,        │                           │
  │     refreshToken} ──────┤                           │
  │                         │                           │
  ├── GET /api/v1/... ─────>│                           │
  │   Authorization: Bearer │                           │
  │                         ├── Verify JWT              │
  │                         ├── Process request ───────>│
  │<── Response ────────────┤                           │
```

## Real-Time Communication

WebSocket connections use Socket.io with JWT authentication:

- **`/chat` namespace**: Chat messages, AI streaming responses
- **`/` namespace**: Presence, notifications

## AI Provider Architecture

All LLM requests route through OpenRouter for unified access:

```
Backend AI Service
       │
  ┌────┴─────┐
  │OpenRouter │ ──> OpenAI (GPT-4o, GPT-4o Mini)
  │ Gateway   │ ──> Anthropic (Claude 4.5 Opus/Sonnet/Haiku)
  └───────────┘ ──> Google (Gemini 2.5 Pro/Flash)
                ──> DeepSeek (V3, R1)
                ──> Meta (Llama 3.3)
                ──> And more...
```
