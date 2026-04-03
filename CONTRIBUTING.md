# Contributing to Wants AI

Thank you for your interest in contributing to Wants AI! This guide will help you get started and ensure a smooth collaboration process.

## What is Wants AI?

Wants AI is an **intent-driven AI platform** that renders contextual user interfaces based on user intent. Instead of producing only text responses like a traditional chatbot, Wants AI detects what a user wants to accomplish and dynamically renders the appropriate UI -- whether that is a calculator, a code editor, a travel planner, or any of its 1,100+ tools.

The platform supports 30+ AI models (GPT-4, Claude, Gemini, Llama, Mistral, and more) and 100+ third-party integrations.

We welcome contributions of all kinds: bug fixes, new tools, documentation improvements, performance optimizations, and feature ideas.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Creating a New Tool](#creating-a-new-tool)
- [Commit Conventions](#commit-conventions)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)
- [Community](#community)
- [License](#license)

---

## Getting Started

### Prerequisites

| Dependency     | Minimum Version | Notes                          |
| -------------- | --------------- | ------------------------------ |
| Node.js        | 20.0+           | LTS recommended                |
| npm            | 10.0+           | Ships with Node 20+            |
| PostgreSQL     | 15+             | Or use the Docker setup below  |
| Redis          | 7+              | Or use the Docker setup below  |
| Docker         | 24+             | Optional, but recommended      |
| Flutter        | 3.x             | Only needed for mobile work    |

### Clone and Install

```bash
# 1. Fork the repository on GitHub, then clone your fork
git clone https://github.com/<your-username>/wants-chat.git
cd wants-chat

# 2. Install dependencies (npm workspaces will handle frontend + backend)
npm install

# 3. Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit both .env files with your local database credentials, API keys, etc.
```

### Database Setup

**Option A -- Docker (recommended):**

```bash
docker-compose up -d postgres redis
```

This starts PostgreSQL 15 and Redis 7 with sensible defaults. See `docker-compose.yml` for configuration.

**Option B -- Local install:**

Create a PostgreSQL database and update `backend/.env` with your connection string. Make sure Redis is running on the default port (6379).

---

## Project Structure

```
wants-chat/
├── frontend/               # React 19 + TypeScript + Vite + TailwindCSS
│   └── src/
│       ├── components/     # React components
│       │   ├── landing/    # Landing page sections
│       │   ├── tools/      # 1,100+ tool components (contextual UI)
│       │   └── ui/         # shadcn/ui primitives
│       ├── pages/          # Route-level page components
│       ├── config/         # Centralized configuration (pricing, SEO)
│       ├── contexts/       # React contexts (auth, theme, etc.)
│       ├── hooks/          # Custom React hooks
│       ├── data/           # Static data (tool definitions, categories)
│       └── lib/            # Utility functions
├── backend/                # NestJS + PostgreSQL (raw pg) + Redis + Socket.io
│   └── src/
│       └── modules/        # NestJS feature modules
│           ├── ai/         # Multi-provider AI integration
│           ├── auth/       # Authentication
│           ├── chat/       # Real-time chat (Socket.io)
│           ├── intent/     # Intent detection engine
│           ├── tools/      # Tool registry and execution
│           ├── database/   # Database service (raw pg)
│           └── ...         # 40+ other modules
├── mobile/                 # Flutter/Dart mobile app
├── extension/              # Browser extension (Chrome/Firefox)
├── apps/                   # Standalone micro-apps (130+)
├── scripts/                # Build and utility scripts
├── docker-compose.yml      # Local development services
└── package.json            # Workspace root (npm workspaces)
```

---

## Development Workflow

### Running Locally

```bash
# Start everything (backend + frontend concurrently)
npm run dev

# Or start services individually
npm run dev:backend     # NestJS on http://localhost:3000
npm run dev:frontend    # Vite on http://localhost:5173
```

Both the frontend and backend support hot reload out of the box. Vite provides instant HMR for the frontend, and NestJS watches for file changes on the backend.

### Using Docker Compose

To run the full stack including infrastructure:

```bash
docker-compose up
```

This starts PostgreSQL, Redis, the backend, and the frontend. See `docker-compose.yml` for service definitions and port mappings.

### Mobile Development

```bash
cd mobile
flutter pub get
flutter run
```

### Running Tests

```bash
# Run all workspace tests
npm test

# Run linting
npm run lint

# Fix lint issues automatically
npm run lint:fix
```

---

## Code Style

### General Principles

- Write clear, self-documenting code. Prefer readability over cleverness.
- Keep functions small and focused on a single responsibility.
- Use TypeScript strict mode. Avoid `any` unless absolutely necessary.

### TypeScript / React (Frontend)

- **Functional components only** -- no class components.
- **Hooks** for state and side effects (`useState`, `useEffect`, custom hooks).
- **React Query** (`useQuery`, `useMutation`) for server state management.
- **TailwindCSS** for styling -- avoid inline styles and CSS modules.
- **shadcn/ui** for UI primitives (Button, Dialog, Card, etc.). Do not introduce competing component libraries.
- **Framer Motion** for animations.
- Use `import.meta.env.VITE_*` for environment variables on the frontend.

```tsx
// Preferred component pattern
export function ToolCard({ tool }: { tool: Tool }) {
  const { data, isLoading } = useToolData(tool.id);

  if (isLoading) return <Skeleton />;

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold">{tool.name}</h3>
      <p className="text-muted-foreground">{tool.description}</p>
    </Card>
  );
}
```

### TypeScript / NestJS (Backend)

- Follow NestJS conventions: **Modules**, **Services**, **Controllers**.
- Use the raw `pg` database service (`db.query`) rather than an ORM.
- Use `.get()` for SELECT queries returning multiple rows, `.first()` for a single row, and `.execute()` for INSERT/UPDATE/DELETE.
- Always transform database fields from `snake_case` to `camelCase` before returning to the frontend.
- Validate request bodies with DTOs or Zod schemas.

```typescript
// Database query examples
const items = await db.query.from('tools').select('*').where('status', 'active').get();
const item = await db.query.from('tools').where('id', toolId).first();
```

### Flutter / Dart (Mobile)

- Follow official Dart style guidelines and `flutter analyze` recommendations.
- Use the provider pattern for state management.
- Keep widgets small and composable.

---

## Creating a New Tool

Tools are the core of Wants AI. Each tool is a React component that renders contextual UI when the platform detects a matching user intent.

### Step-by-step

1. **Create the component** in `frontend/src/components/tools/`:

```tsx
// frontend/src/components/tools/MyNewTool.tsx
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MyNewTool() {
  const [result, setResult] = useState<string | null>(null);

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-bold">My New Tool</h2>
      {/* Tool-specific UI here */}
      <Button onClick={() => setResult("Done!")}>Run</Button>
      {result && <p className="text-sm text-muted-foreground">{result}</p>}
    </Card>
  );
}
```

2. **Register the tool** in the tool registry / data definitions so the intent engine can route users to it.

3. **Add backend support** if the tool needs server-side processing (create a new module or extend an existing one under `backend/src/modules/`).

4. **Test** the tool by running the app locally and verifying the UI renders correctly for the intended user query.

---

## Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/) to keep the git history readable and to support automated changelogs.

### Format

```
<type>(<optional scope>): <short description>

<optional body>

<optional footer>
```

### Types

| Type       | When to use                                      |
| ---------- | ------------------------------------------------ |
| `feat`     | A new feature or tool                            |
| `fix`      | A bug fix                                        |
| `docs`     | Documentation only changes                       |
| `style`    | Formatting, missing semicolons, etc. (no logic)  |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf`     | Performance improvement                          |
| `test`     | Adding or updating tests                         |
| `chore`    | Build process, CI, dependency updates            |

### Examples

```
feat(tools): add mortgage calculator tool
fix(chat): resolve WebSocket reconnection on token refresh
docs: update CONTRIBUTING guide with tool creation steps
refactor(backend): extract intent matching into dedicated service
```

---

## Pull Request Process

1. **Fork** the repository and create a feature branch from `main`:
   ```bash
   git checkout -b feat/my-new-feature
   ```

2. **Make your changes** following the code style and conventions above.

3. **Write or update tests** if applicable.

4. **Run linting and tests** before pushing:
   ```bash
   npm run lint
   npm test
   ```

5. **Push** your branch and open a Pull Request against `main`:
   ```bash
   git push origin feat/my-new-feature
   ```

6. **Fill out the PR template** with:
   - A clear summary of what changed and why.
   - Steps to test or verify the change.
   - Screenshots or recordings for UI changes.

7. **Respond to review feedback.** A maintainer will review your PR. Please be patient -- we aim to review PRs within a few business days.

### PR Checklist

- [ ] Code follows the project's style guidelines.
- [ ] Self-reviewed the diff for typos, debug logs, and leftover comments.
- [ ] Added or updated tests where appropriate.
- [ ] Linting passes with no new warnings.
- [ ] Commit messages follow Conventional Commits.
- [ ] PR description explains the "why", not just the "what".

---

## Reporting Issues

### Bug Reports

Open an issue on [GitHub Issues](https://github.com/wants-chat/wants-chat/issues) with:

- **Title**: A concise description of the bug.
- **Environment**: OS, browser, Node.js version, and any other relevant details.
- **Steps to reproduce**: Numbered steps to trigger the issue.
- **Expected behavior**: What you expected to happen.
- **Actual behavior**: What actually happened (include error messages, screenshots, or logs).

### Feature Requests

We love new ideas! Open an issue with the `enhancement` label and describe:

- **The problem** you are trying to solve.
- **Your proposed solution** (if you have one).
- **Alternatives** you have considered.

---

## Community

- **GitHub Discussions**: Ask questions, share ideas, and connect with other contributors at [github.com/wants-chat/wants-chat/discussions](https://github.com/wants-chat/wants-chat/discussions).
- **Issues**: Browse or file issues at [github.com/wants-chat/wants-chat/issues](https://github.com/wants-chat/wants-chat/issues).

### Code of Conduct

We are committed to providing a welcoming and inclusive experience for everyone. All participants are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). In short: be respectful, be constructive, and assume good intent.

---

## License

Wants AI is licensed under the **[GNU Affero General Public License v3.0 (AGPL-3.0)](LICENSE)**. By contributing, you agree that your contributions will be licensed under the same license.

---

Thank you for helping make Wants AI better. We appreciate every contribution, no matter how small.
