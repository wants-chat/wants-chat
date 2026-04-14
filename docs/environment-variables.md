# Environment Variables Reference

## Backend (`backend/.env`)

### Database (Required)

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `wantsdb` | Database name |
| `DB_USER` | `postgres` | Database user |
| `DB_PASSWORD` | - | Database password |
| `DB_SSL` | `false` | Enable SSL for database connection |
| `DB_POOL_MAX` | `20` | Maximum connection pool size |

### Server (Required)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `NODE_ENV` | `development` | Environment (`development` / `production`) |
| `API_PREFIX` | `api/v1` | API route prefix |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origins (comma-separated) |
| `FRONTEND_URL` | `http://localhost:5173` | Frontend URL (used in emails) |

### Authentication (Required)

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | - | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | `7d` | Access token expiry |
| `JWT_REFRESH_EXPIRES_IN` | `30d` | Refresh token expiry |

### AI Services (Required for AI features)

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENROUTER_API_KEY` | - | OpenRouter API key (primary LLM gateway) |
| `OPENAI_API_KEY` | - | OpenAI API key (fallback) |
| `OPENAI_MODEL` | `openai/gpt-4o-mini` | Default chat model |
| `USE_LLM_ROUTER` | `true` | Enable multi-provider routing |

### Image/Video Generation (Optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `RUNWARE_API_KEY` | - | Runware API key for image generation |
| `RUNWARE_API_URL` | `https://api.runware.ai/v1` | Runware API endpoint |

### Storage (Optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `CLOUDFLARE_ACCOUNT_ID` | - | Cloudflare account ID |
| `CLOUDFLARE_R2_BUCKET_NAME` | - | R2 bucket name |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | - | R2 access key |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | - | R2 secret key |
| `CLOUDFLARE_R2_PUBLIC_URL` | - | Public CDN URL |

### Email (Optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `AWS_ACCESS_KEY_ID` | - | AWS access key for SES |
| `AWS_SECRET_ACCESS_KEY` | - | AWS secret key for SES |
| `AWS_REGION` | `us-east-1` | AWS region |
| `EMAIL_DEFAULT_FROM` | `noreply@localhost` | Default sender email (set to your own domain) |

### OAuth (Optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `GOOGLE_CLIENT_ID` | - | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | - | Google OAuth client secret |
| `GITHUB_APP_CLIENT_ID` | - | GitHub App client ID |
| `GITHUB_APP_CLIENT_SECRET` | - | GitHub App client secret |

### Research Features (Optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `TAVILY_API_KEY` | - | Tavily web search API |
| `JINA_API_KEY` | - | Jina content extraction |
| `FIRECRAWL_API_KEY` | - | Firecrawl web scraping |

---

## Frontend (`frontend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:3001` | Backend API URL |
| `VITE_SOCKET_URL` | `http://localhost:3001` | WebSocket URL |
| `VITE_APP_NAME` | `Wants Chat` | Application name |
| `VITE_SITE_URL` | `http://localhost:5173` | Frontend URL |
| `VITE_GA_MEASUREMENT_ID` | - | Google Analytics 4 ID (optional) |
| `VITE_DEBUG` | `false` | Enable debug logging |

---

## Mobile (`mobile/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `API_BASE_URL` | `http://localhost:3001/api` | Backend API URL |
