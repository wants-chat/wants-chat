# Deployment Status

## ✅ Completed Tasks

1. **Repository Setup**
   - ✅ Removed `.git` folders from backend, frontend, and mobile subdirectories
   - ✅ Initialized main git repository
   - ✅ Pushed to https://github.com/infoinlet-prod/widest-life

2. **GitHub Actions Workflow**
   - ✅ Created `.github/workflows/deploy.yml`
   - ✅ Added database migration step (`npm run migrate`)
   - ✅ Configured for CAX31 server (46.62.146.236)
   - ✅ Workflow auto-triggers on push to `main` branch

3. **Server Setup (CAX31 - 46.62.146.236)**
   - ✅ Created `/opt/widest-life/backend` directory
   - ✅ Created `/opt/widest-life/frontend` directory
   - ✅ Verified Node.js v20.19.5 installed
   - ✅ Verified npm v10.8.2 installed
   - ✅ Verified PM2 v6.0.13 installed
   - ✅ Verified git v2.43.0 installed
   - ✅ Initialized git repository
   - ✅ Pulled latest code from GitHub

4. **GitHub Secrets Configured**
   - ✅ SSH_PRIVATE_KEY (content of ~/.ssh/hetzner_fluxez)
   - ✅ SERVER_IP (46.62.146.236)

## 🔄 Next Steps Required

### 1. Update Environment Variables (CRITICAL)

The `.env.production` file has been created on the server but needs your actual credentials:

```bash
ssh -i ~/.ssh/hetzner_fluxez root@46.62.146.236
nano /opt/widest-life/backend/.env.production
```

Update these values:
- `FLUXEZ_API_KEY` - Your Fluxez service role key
- `FLUXEZ_ANON_KEY` - Your Fluxez anon key
- `JWT_SECRET` - A secure random string for production
- `CORS_ORIGIN` - Your production frontend URL(s)

### 2. Complete Deployment

After updating the environment variables, run:

```bash
ssh -i ~/.ssh/hetzner_fluxez root@46.62.146.236 << 'EOF'
cd /opt/widest-life/backend
npm ci --production=false
npm run build
npm run migrate
pm2 delete widest-life-backend 2>/dev/null || true
NODE_ENV=production pm2 start dist/main.js --name widest-life-backend
pm2 save
pm2 status
EOF
```

### 3. Deploy Frontend

```bash
ssh -i ~/.ssh/hetzner_fluxez root@46.62.146.236 << 'EOF'
cd /opt/widest-life/frontend
npm ci
npm run build
pm2 delete widest-life-frontend 2>/dev/null || true
pm2 start npm --name widest-life-frontend -- start
pm2 save
pm2 status
EOF
```

### 4. Verify Deployment

```bash
# Check PM2 status
ssh -i ~/.ssh/hetzner_fluxez root@46.62.146.236 "pm2 status"

# Check backend logs
ssh -i ~/.ssh/hetzner_fluxez root@46.62.146.236 "pm2 logs widest-life-backend --lines 50"

# Check frontend logs
ssh -i ~/.ssh/hetzner_fluxez root@46.62.146.236 "pm2 logs widest-life-frontend --lines 50"
```

## 📋 PM2 Process Names

- **Backend**: `widest-life-backend`
- **Frontend**: `widest-life-frontend`

## 🔄 Future Deployments

Once the initial setup is complete, deployments will be automatic:

1. **Automatic**: Push to `main` branch triggers GitHub Actions
2. **Manual**: Go to Actions tab → "Deploy to CAX31 Server" → "Run workflow"

The workflow will:
- Pull latest code
- Backup and restore `.env.production`
- Install dependencies
- Build backend and frontend
- Run database migrations
- Restart PM2 processes

## 🔍 Useful Commands

```bash
# SSH to server
ssh -i ~/.ssh/hetzner_fluxez root@46.62.146.236

# Check all PM2 processes
ssh -i ~/.ssh/hetzner_fluxez root@46.62.146.236 "pm2 status"

# View backend logs
ssh -i ~/.ssh/hetzner_fluxez root@46.62.146.236 "pm2 logs widest-life-backend"

# View frontend logs
ssh -i ~/.ssh/hetzner_fluxez root@46.62.146.236 "pm2 logs widest-life-frontend"

# Restart backend
ssh -i ~/.ssh/hetzner_fluxez root@46.62.146.236 "pm2 restart widest-life-backend"

# Restart frontend
ssh -i ~/.ssh/hetzner_fluxez root@46.62.146.236 "pm2 restart widest-life-frontend"

# Stop all
ssh -i ~/.ssh/hetzner_fluxez root@46.62.146.236 "pm2 stop all"

# View PM2 monitoring dashboard
ssh -i ~/.ssh/hetzner_fluxez root@46.62.146.236 "pm2 monit"
```

## 📂 Server Directory Structure

```
/opt/widest-life/
├── .git/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── backend/
│   ├── .env.production          # ⚠️ Needs configuration
│   ├── dist/                     # Build output
│   ├── node_modules/
│   ├── src/
│   └── package.json
├── frontend/
│   ├── .next/ or build/         # Build output
│   ├── node_modules/
│   └── package.json
├── mobile/
├── README.md
└── SETUP.md
```

## 🐛 Troubleshooting

### Build fails with "FLUXEZ_API_KEY not found"
- Update `/opt/widest-life/backend/.env.production` with correct keys

### PM2 process not starting
- Check logs: `pm2 logs widest-life-backend --lines 100`
- Verify build output: `ls -la /opt/widest-life/backend/dist/`

### Frontend not building
- Check if frontend has `package.json` and build script
- Verify Node.js version compatibility

### Migration fails
- Check database connection in `.env.production`
- Verify FLUXEZ_API_KEY has correct permissions
