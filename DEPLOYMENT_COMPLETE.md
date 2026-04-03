# Widest Life - Deployment Complete ✅

## Server Information
- **Server**: CAX31 (Hetzner Cloud)
- **IP Address**: 46.62.146.236
- **Location**: /opt/widest-life/

## Services Running

### Backend API
- **Port**: 3001
- **PM2 Process**: `widest-life-backend`
- **Entry Point**: `dist/src/main.js`
- **Environment**: Production (.env.production)
- **Status**: ✅ Running

### Frontend
- **Port**: 5173
- **PM2 Process**: `widest-life-frontend`
- **Server**: `serve` (static file server)
- **Build Output**: `dist/`
- **Status**: ✅ Running

### Reverse Proxy & SSL
- **Service**: Traefik v3.0.4
- **Container**: `traefik`
- **Ports**:
  - HTTP: 80 → 443 (auto-redirect)
  - HTTPS: 443
  - Dashboard: 8080
- **SSL**: Let's Encrypt (automatic renewal)
- **Status**: ✅ Running

## Domain Configuration

### Domains & SSL Certificates
Traefik is configured to automatically obtain and renew SSL certificates for:

1. **https://widest.life** → Frontend (port 5173)
2. **https://www.widest.life** → Frontend (port 5173)
3. **https://api.widest.life** → Backend API (port 3001)

### DNS Requirements
Before accessing the domains, ensure DNS records point to the server:

```
A Record:  widest.life        → 46.62.146.236
A Record:  www.widest.life    → 46.62.146.236
A Record:  api.widest.life    → 46.62.146.236
```

Or use wildcard:
```
A Record:  *.widest.life      → 46.62.146.236
```

### SSL Certificate Acquisition
Once DNS is configured, Traefik will automatically:
1. Detect incoming HTTPS requests
2. Request SSL certificates from Let's Encrypt
3. Apply certificates to the domains
4. Auto-renew certificates before expiration

## File Structure

```
/opt/widest-life/
├── .git/                          # Git repository
├── backend/
│   ├── .env.production           # Backend environment variables
│   ├── dist/                     # Compiled TypeScript output
│   │   └── src/
│   │       └── main.js          # Entry point
│   ├── node_modules/
│   ├── src/                      # Source code
│   └── package.json
├── frontend/
│   ├── .env.production           # Frontend environment variables
│   ├── dist/                     # Production build
│   │   ├── index.html
│   │   └── assets/
│   ├── node_modules/
│   ├── src/                      # Source code
│   └── package.json
└── mobile/                        # Mobile app (not deployed)

/opt/traefik/
├── docker-compose.yml             # Traefik container config
├── traefik.yml                    # Main Traefik config
├── dynamic/
│   └── widest-life.yml           # Widest Life routing config
└── letsencrypt/
    └── acme.json                  # SSL certificates storage
```

## Deployment Workflow

### GitHub Actions
Repository: https://github.com/infoinlet-prod/widest-life

**Workflow File**: `.github/workflows/deploy.yml`

**Triggers**:
- Automatic: Push to `main` branch
- Manual: Actions tab → "Deploy to CAX31 Server" → Run workflow

**Deployment Steps**:
1. Pull latest code from GitHub
2. Backup `.env.production` files
3. Install dependencies
4. Build backend (TypeScript → JavaScript)
5. Run database migrations
6. Restart backend PM2 process
7. Build frontend (Vite production build)
8. Restart frontend PM2 process
9. Verify deployment

### GitHub Secrets Configured
- ✅ `SSH_PRIVATE_KEY` - SSH key for server access
- ✅ `SERVER_IP` - 46.62.146.236

## Management Commands

### SSH Access
```bash
ssh -i ~/.ssh/hetzner_fluxez root@46.62.146.236
```

### PM2 Commands
```bash
# View all processes
pm2 status

# View backend logs
pm2 logs widest-life-backend

# View frontend logs
pm2 logs widest-life-frontend

# Restart backend
pm2 restart widest-life-backend

# Restart frontend
pm2 restart widest-life-frontend

# Stop all
pm2 stop all

# Start all
pm2 start all

# Save PM2 configuration
pm2 save

# View real-time monitoring
pm2 monit
```

### Traefik Commands
```bash
# View Traefik logs
docker logs traefik

# Restart Traefik
cd /opt/traefik && docker-compose restart

# View Traefik dashboard
# Open browser: http://46.62.146.236:8080/dashboard/
```

### Manual Deployment
```bash
# Backend
ssh -i ~/.ssh/hetzner_fluxez root@46.62.146.236 << 'EOF'
  cd /opt/widest-life/backend
  git pull origin main
  npm ci --production=false
  npm run build
  npm run migrate
  pm2 restart widest-life-backend
EOF

# Frontend
ssh -i ~/.ssh/hetzner_fluxez root@46.62.146.236 << 'EOF'
  cd /opt/widest-life/frontend
  git pull origin main
  npm ci
  npm run build
  pm2 restart widest-life-frontend
EOF
```

## Environment Variables

### Backend (.env.production)
```env
FLUXEZ_API_KEY=service_***         # Fluxez service role key
FLUXEZ_ANON_KEY=anon_***           # Fluxez anon key
PORT=3001                           # Backend port
NODE_ENV=production                 # Environment
JWT_SECRET=***                      # JWT secret for auth
JWT_EXPIRES_IN=7d                   # JWT expiration
CORS_ORIGIN=https://widest.life,https://www.widest.life
API_PREFIX=api/v1                   # API prefix
```

### Frontend (.env.production)
```env
VITE_API_URL=https://api.widest.life/api/v1
# Add other frontend env vars as needed
```

## Traefik Configuration

### Main Config (`/opt/traefik/traefik.yml`)
- Auto-redirect HTTP → HTTPS
- Let's Encrypt integration
- TLS challenge for SSL
- File provider for dynamic configs
- Docker provider for container discovery

### Dynamic Config (`/opt/traefik/dynamic/widest-life.yml`)
- Routes for widest.life, www.widest.life → Frontend
- Route for api.widest.life → Backend
- CORS headers for API
- SSL certificate resolvers

## Monitoring & Health Checks

### Check All Services
```bash
ssh -i ~/.ssh/hetzner_fluxez root@46.62.146.236 << 'EOF'
  echo "=== PM2 Status ==="
  pm2 status

  echo -e "\n=== Traefik Status ==="
  docker ps --filter name=traefik

  echo -e "\n=== Backend Health ==="
  curl -s http://localhost:3001/api/v1 | head -c 200

  echo -e "\n=== Frontend Health ==="
  curl -s http://localhost:5173 | head -c 200
EOF
```

### View Logs
```bash
# All logs together
ssh -i ~/.ssh/hetzner_fluxez root@46.62.146.236 "pm2 logs --lines 50"

# Backend only
ssh -i ~/.ssh/hetzner_fluxez root@46.62.146.236 "pm2 logs widest-life-backend --lines 100"

# Traefik logs
ssh -i ~/.ssh/hetzner_fluxez root@46.62.146.236 "docker logs traefik --tail 100"
```

## SSL Certificate Management

### Automatic Renewal
- Traefik automatically renews certificates before expiration
- Renewal check runs daily via systemd timer
- Certificates stored in `/opt/traefik/letsencrypt/acme.json`

### Manual Certificate Check
```bash
# View certificate status
ssh -i ~/.ssh/hetzner_fluxez root@46.62.146.236 "docker logs traefik 2>&1 | grep -i cert"
```

### Force Certificate Renewal (if needed)
```bash
ssh -i ~/.ssh/hetzner_fluxez root@46.62.146.236 << 'EOF'
  cd /opt/traefik
  # Backup current certificates
  cp letsencrypt/acme.json letsencrypt/acme.json.backup
  # Remove old certificates
  rm letsencrypt/acme.json
  touch letsencrypt/acme.json
  chmod 600 letsencrypt/acme.json
  # Restart Traefik to obtain new certificates
  docker-compose restart
EOF
```

## Troubleshooting

### Backend Not Starting
```bash
# Check logs
pm2 logs widest-life-backend --lines 100

# Common issues:
# 1. FLUXEZ_API_KEY not found - Check .env.production exists and has correct values
# 2. Port 3001 in use - Check: netstat -tulpn | grep 3001
# 3. Build failed - Run: cd /opt/widest-life/backend && npm run build
```

### Frontend Not Accessible
```bash
# Check if serve is running
pm2 logs widest-life-frontend --lines 50

# Check if port 5173 is listening
netstat -tulpn | grep 5173

# Rebuild frontend
cd /opt/widest-life/frontend && npm run build
```

### SSL Certificate Not Issuing
1. **Check DNS**: Ensure domains point to 46.62.146.236
   ```bash
   dig widest.life +short
   dig www.widest.life +short
   dig api.widest.life +short
   ```

2. **Check Traefik logs**:
   ```bash
   docker logs traefik 2>&1 | grep -i "acme\|certificate\|error"
   ```

3. **Verify domain accessibility**:
   ```bash
   curl -I http://widest.life
   ```

### Traefik Not Routing
```bash
# Check Traefik configuration
cat /opt/traefik/dynamic/widest-life.yml

# Restart Traefik
cd /opt/traefik && docker-compose restart

# Check if backend/frontend are responding locally
curl http://172.17.0.1:3001/api/v1
curl http://172.17.0.1:5173
```

## Security Considerations

1. **SSH Key**: Keep `~/.ssh/hetzner_fluxez` secure
2. **Environment Files**: Never commit `.env.production` to git
3. **GitHub Secrets**: Stored securely in GitHub
4. **SSL Certificates**: Auto-renewed by Traefik
5. **CORS**: Configured to allow only widest.life domains

## Next Steps

1. **Configure DNS**: Point domains to 46.62.146.236
2. **Wait for SSL**: Traefik will auto-obtain certificates (takes 1-2 minutes)
3. **Test URLs**:
   - https://widest.life
   - https://www.widest.life
   - https://api.widest.life/api/v1
4. **Update Frontend**: Configure `VITE_API_URL` in frontend/.env.production if needed
5. **Monitor Logs**: Check PM2 and Traefik logs for any issues

## Support

For issues or questions:
- Check logs: `pm2 logs` and `docker logs traefik`
- Review this document's Troubleshooting section
- Verify DNS configuration
- Check GitHub Actions logs for deployment issues

---

**Deployment Date**: 2025-10-07
**Server**: CAX31 (46.62.146.236)
**Status**: ✅ All services running and configured
