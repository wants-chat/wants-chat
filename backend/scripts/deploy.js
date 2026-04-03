#!/usr/bin/env node

/**
 * AppAtOnce Deployment Script for life-os-backend
 * 
 * This script deploys your NestJS backend using the AppAtOnce platform
 * It will automatically detect the project type and deploy to the best platform
 * based on your billing tier (FREE tier = Google Cloud Run)
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const APPATONCE_API_URL = process.env.APPATONCE_API_URL || 'http://localhost:8091/api';
const API_KEY = process.env.APPATONCE_API_KEY; // Your free account API key
const PROJECT_PATH = path.resolve(__dirname, '..');

class LifeOSDeployer {
  constructor() {
    this.apiClient = axios.create({
      baseURL: APPATONCE_API_URL,
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
    });
  }

  async detectProject() {
    console.log('🔍 Detecting project configuration...');
    
    try {
      const response = await this.apiClient.post('/smart-deployment/detect', {
        projectPath: PROJECT_PATH,
        autoDetect: true,
      });

      const { detection, strategy } = response.data;
      
      console.log('✅ Project detected:');
      console.log(`   Type: ${detection.type}`);
      console.log(`   Framework: ${detection.framework}`);
      console.log(`   Language: ${detection.language}`);
      console.log(`   Build Command: ${detection.buildCommand}`);
      console.log(`   Start Command: ${detection.startCommand}`);
      console.log(`   Has Database: ${detection.hasDatabase}`);
      console.log(`   Migration Command: ${detection.migrationCommand}`);
      
      console.log('\n📊 Deployment Strategy:');
      console.log(`   Platform: ${strategy.backend?.name || 'Not determined'}`);
      console.log(`   Provider: ${strategy.backend?.provider || 'Not determined'}`);
      console.log(`   Estimated Cost: $${strategy.estimatedCost.monthly}/month`);
      
      if (strategy.backend?.pricing.free) {
        console.log(`   ✨ FREE Tier Available: ${strategy.backend.pricing.freeTier}`);
      }
      
      return { detection, strategy };
    } catch (error) {
      console.error('❌ Failed to detect project:', error.response?.data || error.message);
      throw error;
    }
  }

  async deploy(options = {}) {
    console.log('\n🚀 Starting deployment...');
    
    // Read environment variables from .env file
    const envPath = path.join(PROJECT_PATH, '.env');
    const envVars = {};
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      envContent.split('\n').forEach(line => {
        if (line && !line.startsWith('#')) {
          const [key, value] = line.split('=');
          if (key && value) {
            envVars[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
          }
        }
      });
    }

    try {
      const deploymentData = {
        projectPath: PROJECT_PATH,
        branch: options.branch || 'main',
        environmentVariables: {
          ...envVars,
          NODE_ENV: 'production',
        },
        autoMigrate: options.migrate !== false,
        preferredProvider: options.provider || 'google-cloud-run',
      };

      console.log('📦 Deployment configuration:');
      console.log(`   Branch: ${deploymentData.branch}`);
      console.log(`   Auto-migrate: ${deploymentData.autoMigrate}`);
      console.log(`   Provider: ${deploymentData.preferredProvider}`);
      console.log(`   Environment variables: ${Object.keys(deploymentData.environmentVariables).length} variables`);

      // For now, we'll simulate the deployment since we need project/app ID
      console.log('\n⚠️  To complete deployment, you need to:');
      console.log('1. Create a project in AppAtOnce dashboard');
      console.log('2. Get your project ID or app ID');
      console.log('3. Set up Google Cloud credentials:');
      console.log('   - Create a GCP project');
      console.log('   - Enable Cloud Run API');
      console.log('   - Create a service account');
      console.log('   - Download credentials JSON');
      console.log('   - Set GOOGLE_APPLICATION_CREDENTIALS environment variable');
      console.log('\n4. Then run: npm run deploy:prod');
      
      // Uncomment this when you have project/app ID
      /*
      const response = await this.apiClient.post('/smart-deployment/projects/YOUR_PROJECT_ID/deploy', deploymentData);
      
      const deployment = response.data;
      console.log(`\n✅ Deployment initiated: ${deployment.deploymentId}`);
      console.log(`   Status: ${deployment.status}`);
      console.log(`   Provider: ${deployment.provider}`);
      console.log(`   Tracking URL: ${APPATONCE_API_URL}${deployment.trackingUrl}`);
      
      // Track progress
      await this.trackProgress(deployment.deploymentId);
      */
      
    } catch (error) {
      console.error('❌ Deployment failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async trackProgress(deploymentId) {
    console.log('\n📊 Tracking deployment progress...');
    
    let lastProgress = 0;
    const checkInterval = setInterval(async () => {
      try {
        const response = await this.apiClient.get(`/smart-deployment/deployments/${deploymentId}/progress`);
        const progress = response.data;
        
        if (progress.progress > lastProgress) {
          console.log(`   [${progress.progress}%] ${progress.stage}: ${progress.logs[progress.logs.length - 1] || ''}`);
          lastProgress = progress.progress;
        }
        
        if (progress.status === 'running') {
          clearInterval(checkInterval);
          console.log(`\n✅ Deployment successful!`);
          console.log(`   URL: ${progress.url}`);
        } else if (progress.status === 'failed') {
          clearInterval(checkInterval);
          console.error(`\n❌ Deployment failed: ${progress.error}`);
        }
      } catch (error) {
        clearInterval(checkInterval);
        console.error('❌ Failed to track progress:', error.message);
      }
    }, 3000);
  }

  async localDockerDeploy() {
    console.log('\n🐳 Deploying locally with Docker...');
    
    // Create Dockerfile if it doesn't exist
    const dockerfilePath = path.join(PROJECT_PATH, 'Dockerfile');
    if (!fs.existsSync(dockerfilePath)) {
      console.log('📝 Creating Dockerfile...');
      const dockerfile = `
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
`;
      fs.writeFileSync(dockerfilePath, dockerfile.trim());
    }

    try {
      console.log('🔨 Building Docker image...');
      execSync('docker build -t life-os-backend .', { 
        cwd: PROJECT_PATH,
        stdio: 'inherit' 
      });
      
      console.log('🏃 Running Docker container...');
      execSync('docker run -d --name life-os-backend -p 3000:3000 --env-file .env life-os-backend', {
        cwd: PROJECT_PATH,
        stdio: 'inherit'
      });
      
      console.log('\n✅ Local deployment successful!');
      console.log('   URL: http://localhost:3000');
      console.log('   Container: life-os-backend');
      console.log('\n   Stop with: docker stop life-os-backend');
      console.log('   Remove with: docker rm life-os-backend');
    } catch (error) {
      console.error('❌ Docker deployment failed:', error.message);
      throw error;
    }
  }
}

// Main execution
async function main() {
  const deployer = new LifeOSDeployer();
  const args = process.argv.slice(2);
  const command = args[0] || 'detect';

  if (!API_KEY && command !== 'local') {
    console.error('❌ APPATONCE_API_KEY environment variable is required');
    console.log('\nSet your API key:');
    console.log('  export APPATONCE_API_KEY=your-api-key');
    console.log('\nOr add it to your .env file:');
    console.log('  APPATONCE_API_KEY=your-api-key');
    process.exit(1);
  }

  try {
    switch (command) {
      case 'detect':
        await deployer.detectProject();
        break;
      
      case 'deploy':
        await deployer.detectProject();
        await deployer.deploy({
          branch: args[1] || 'main',
          provider: args[2],
          migrate: true,
        });
        break;
      
      case 'local':
        await deployer.localDockerDeploy();
        break;
      
      default:
        console.log('Usage:');
        console.log('  node scripts/deploy.js detect    - Detect project configuration');
        console.log('  node scripts/deploy.js deploy    - Deploy to cloud platform');
        console.log('  node scripts/deploy.js local     - Deploy locally with Docker');
    }
  } catch (error) {
    console.error('\n❌ Operation failed:', error.message);
    process.exit(1);
  }
}

// Check if required dependencies are installed
try {
  require('axios');
} catch (error) {
  console.log('📦 Installing required dependencies...');
  execSync('npm install axios', { stdio: 'inherit' });
}

main();