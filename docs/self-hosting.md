# Self-Hosting Guide

Deploy Wants AI on your own infrastructure.

## Requirements

- **Server**: 2+ CPU cores, 4GB+ RAM
- **Docker**: 20.10+ with Docker Compose v2
- **Domain**: With DNS configured (optional but recommended)
- **Database**: PostgreSQL 15+ (included in Docker Compose)

## Quick Start with Docker Compose

```bash
# Clone the repository
git clone https://github.com/wants-chat/wants-chat.git
cd wants-chat

# Copy and configure environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit backend/.env with your configuration:
# - Set strong DB_PASSWORD and JWT_SECRET
# - Add your OPENROUTER_API_KEY for AI features
# - Configure CORS_ORIGIN with your domain

# Start in production mode
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Environment Configuration

### Required Variables

| Variable | Description |
|----------|-------------|
| `DB_PASSWORD` | PostgreSQL password (use a strong, random password) |
| `JWT_SECRET` | Secret for JWT token signing (use a long random string) |
| `OPENROUTER_API_KEY` | API key from [OpenRouter](https://openrouter.ai) for AI features |
| `CORS_ORIGIN` | Your frontend domain (e.g., `https://your-domain.com`) |
| `FRONTEND_URL` | Your frontend URL (for email links) |

### Optional Variables

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | For billing/subscriptions |
| `CLOUDFLARE_R2_*` | For file storage (images, documents) |
| `AWS_*` | For email sending via SES |
| `RUNWARE_API_KEY` | For AI image generation |

## Architecture

```
                    ┌──────────────┐
                    │    Nginx     │ :80/:443
                    │  (Frontend)  │
                    └──────┬───────┘
                           │
                    ┌──────┴───────┐
                    │   Backend    │ :3001
                    │   (NestJS)   │
                    └──┬───────┬───┘
                       │       │
              ┌────────┴┐   ┌─┴────────┐
              │ Postgres │   │  Redis   │
              │  :5432   │   │  :6379   │
              └──────────┘   └──────────┘
```

## Reverse Proxy (Nginx)

If deploying behind a reverse proxy, configure Nginx:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

## SSL/TLS

We recommend using [Certbot](https://certbot.eff.org/) with Let's Encrypt:

```bash
sudo certbot --nginx -d your-domain.com
```

## Updating

```bash
cd wants-chat
git pull origin main
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## Monitoring

Check service health:

```bash
# Service status
docker compose ps

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Health check endpoint
curl http://localhost:3001/health
```

## Backup

```bash
# Backup PostgreSQL
docker compose exec postgres pg_dump -U postgres wantsdb > backup.sql

# Restore
docker compose exec -T postgres psql -U postgres wantsdb < backup.sql
```

## Troubleshooting

### Backend won't start
- Check database connection: `docker compose logs postgres`
- Verify `.env` has correct `DB_HOST=postgres` (Docker service name)

### Frontend can't reach API
- Check `VITE_API_URL` points to backend
- Verify CORS settings in backend `.env`

### WebSocket disconnects
- Ensure reverse proxy supports WebSocket upgrade
- Check `VITE_SOCKET_URL` configuration
