# Setup Instructions

## GitHub Repository Setup

### 1. Push Initial Code

```bash
git add .
git commit -m "Initial commit: Setup widest-life project with GitHub Actions deployment"
git branch -M main
git push -u origin main
```

### 2. Configure GitHub Secrets

Go to your GitHub repository: https://github.com/infoinlet-prod/widest-life

Navigate to: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add the following secrets:

#### SSH_PRIVATE_KEY
```bash
# On your local machine, get the private key content:
cat ~/.ssh/hetzner_fluxez
```
Copy the entire output (including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`) and paste it as the secret value.

#### SERVER_IP
Value: `46.62.146.236`

### 3. Server Preparation

The CAX31 server needs to have:
- Node.js 20.x installed
- PM2 installed globally
- Git installed
- Directory `/opt/widest-life` created (already done)

To verify server setup:
```bash
ssh -i ~/.ssh/hetzner_fluxez root@46.62.146.236 << 'EOF'
  node --version
  npm --version
  pm2 --version
  git --version
  ls -la /opt/widest-life
EOF
```

### 4. Clone Repository on Server

```bash
ssh -i ~/.ssh/hetzner_fluxez root@46.62.146.236 << 'EOF'
  cd /opt/widest-life
  git init
  git remote add origin https://github.com/infoinlet-prod/widest-life.git
  git fetch origin
  git checkout -b main origin/main
EOF
```

### 5. Setup Environment Files on Server

```bash
# Create backend .env.production file
ssh -i ~/.ssh/hetzner_fluxez root@46.62.146.236 << 'EOF'
  cd /opt/widest-life/backend
  # Create your .env.production file with necessary environment variables
  nano .env.production
EOF
```

### 6. Test Deployment

After completing the above steps:

1. Go to GitHub Actions tab: https://github.com/infoinlet-prod/widest-life/actions
2. Click on "Deploy to CAX31 Server"
3. Click "Run workflow" → Select "production" → "Run workflow"

Or simply push to main branch:
```bash
git push origin main
```

## Verification

After deployment completes, verify the services are running:

```bash
# Check PM2 status
ssh -i ~/.ssh/hetzner_fluxez root@46.62.146.236 "pm2 status"

# Check backend logs
ssh -i ~/.ssh/hetzner_fluxez root@46.62.146.236 "pm2 logs widest-life-backend --lines 50"

# Check frontend logs
ssh -i ~/.ssh/hetzner_fluxez root@46.62.146.236 "pm2 logs widest-life-frontend --lines 50"
```

## Troubleshooting

### Deployment fails on "git reset --hard origin/main"

If the repository isn't initialized on the server:
```bash
ssh -i ~/.ssh/hetzner_fluxez root@46.62.146.236 << 'EOF'
  cd /opt/widest-life
  rm -rf .git
  git init
  git remote add origin https://github.com/infoinlet-prod/widest-life.git
  git fetch origin
  git checkout -b main origin/main
EOF
```

### PM2 process not starting

Check if the build was successful:
```bash
ssh -i ~/.ssh/hetzner_fluxez root@46.62.146.236 << 'EOF'
  cd /opt/widest-life/backend
  ls -la dist/
  cd /opt/widest-life/frontend
  ls -la .next/ 2>/dev/null || ls -la build/ 2>/dev/null
EOF
```

### Environment variables missing

Ensure `.env.production` exists:
```bash
ssh -i ~/.ssh/hetzner_fluxez root@46.62.146.236 << 'EOF'
  ls -la /opt/widest-life/backend/.env.production
EOF
```
