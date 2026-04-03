#!/usr/bin/env node

/**
 * Deploy life-os-backend using AppAtOnce SDK
 * This uses the smart deployment system we built in appatonce/server
 */

const { AppAtOnceClient } = require('@appatonce/node-sdk');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local or .env
if (fs.existsSync(path.join(__dirname, '.env.local'))) {
  require('dotenv').config({ path: '.env.local' });
} else if (fs.existsSync(path.join(__dirname, '.env'))) {
  require('dotenv').config({ path: '.env' });
}

// Check if we're only detecting the project
const detectOnly = process.env.APPATONCE_DETECT_ONLY === 'true' || process.argv.includes('--detect');

async function main() {
  // Initialize the SDK with your API key
  const apiKey = process.env.APPATONCE_API_KEY;
  
  if (!apiKey) {
    console.error('❌ Error: APPATONCE_API_KEY environment variable is required');
    console.log('\nTo get started:');
    console.log('1. Create a free account at https://appatonce.com');
    console.log('2. Get your API key from the dashboard');
    console.log('3. Set it in your .env.local file:');
    console.log('   APPATONCE_API_KEY=your-api-key');
    process.exit(1);
  }

  const client = AppAtOnceClient.createWithApiKey(apiKey);

  try {
    console.log('🚀 AppAtOnce Smart Deployment System\n');

    // Step 1: Detect project type
    console.log('📦 Detecting project configuration...');
    const detection = await client.deployment.detectProject({
      projectPath: __dirname
    });

    console.log('✅ Project detected:');
    console.log(`   Type: ${detection.type}`);
    console.log(`   Framework: ${detection.framework}`);
    console.log(`   Language: ${detection.language}`);
    if (detection.buildCommand) {
      console.log(`   Build Command: ${detection.buildCommand}`);
    }
    if (detection.startCommand) {
      console.log(`   Start Command: ${detection.startCommand}`);
    }
    if (detection.migrationCommand) {
      console.log(`   Migration Command: ${detection.migrationCommand}`);
    }
    
    if (detection.recommendedPlatforms) {
      console.log('\n📍 Recommended Platforms:');
      if (detection.recommendedPlatforms.backend) {
        const backend = detection.recommendedPlatforms.backend;
        console.log(`   Backend: ${backend.name || backend}`);
        if (backend.reason) {
          console.log(`   Reason: ${backend.reason}`);
        }
      }
      if (detection.recommendedPlatforms.frontend) {
        const frontend = detection.recommendedPlatforms.frontend;
        console.log(`   Frontend: ${frontend.name || frontend}`);
        if (frontend.reason) {
          console.log(`   Reason: ${frontend.reason}`);
        }
      }
    }
    
    if (detection.estimatedCost) {
      console.log('\n💰 Estimated Monthly Cost:');
      console.log(`   Total: $${detection.estimatedCost.monthly}`);
      if (detection.estimatedCost.breakdown) {
        console.log('   Breakdown:');
        Object.entries(detection.estimatedCost.breakdown).forEach(([key, value]) => {
          console.log(`     - ${key}: $${value}`);
        });
      }
    }

    // If we're only detecting, stop here
    if (detectOnly) {
      console.log('\n✅ Project detection complete!');
      console.log('To deploy, run: npm run deploy');
      process.exit(0);
    }

    // Step 2: Deploy the project
    console.log('\n🚢 Starting deployment...');
    
    // Read package.json for deployment
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    
    const deploymentOptions = {
      projectPath: __dirname,
      packageJson: packageJson, // Include package.json for client-side deployment
      branch: process.env.GIT_BRANCH || 'main',
      environmentVariables: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || '3000',
        DATABASE_URL: process.env.DATABASE_URL,
        JWT_SECRET: process.env.JWT_SECRET,
        // Add any other environment variables your app needs
      },
      autoMigrate: true, // Will run the migration command if detected
      preferredProvider: process.env.DEPLOYMENT_PROVIDER || 'google-cloud-run',
      customDomain: process.env.CUSTOM_DOMAIN
    };

    const deployment = await client.deployment.deploy(deploymentOptions);

    console.log(`\n✅ Deployment initiated!`);
    console.log(`   Deployment ID: ${deployment.deploymentId}`);
    console.log(`   Provider: ${deployment.provider}`);
    console.log(`   Status: ${deployment.status}`);
    if (deployment.estimatedTime) {
      console.log(`   Estimated Time: ${deployment.estimatedTime}`);
    }
    if (deployment.trackingUrl) {
      console.log(`   Tracking URL: ${deployment.trackingUrl}`);
    }

    // Step 3: Track deployment progress
    console.log('\n📊 Tracking deployment progress...');
    
    const finalStatus = await client.deployment.trackProgress(deployment.deploymentId, {
      onProgress: (update) => {
        const progressBar = '█'.repeat(Math.floor(update.progress / 5)) + '░'.repeat(20 - Math.floor(update.progress / 5));
        console.log(`   [${progressBar}] ${update.progress}% - ${update.stage}`);
        
        // Show recent logs if available
        if (update.logs && update.logs.length > 0) {
          const recentLog = update.logs[update.logs.length - 1];
          console.log(`     ${recentLog}`);
        }
      },
      pollInterval: 3000 // Check every 3 seconds
    });

    console.log(`\n✅ Deployment complete!`);
    console.log(`   URL: ${finalStatus.url}`);
    console.log(`   Status: ${finalStatus.status}`);
    
    console.log('\n🎉 Your application is now live!');
    console.log(`\nNext steps:`);
    console.log(`1. Visit your app: ${finalStatus.url}`);
    console.log(`2. Monitor logs: npm run deploy:logs`);
    console.log(`3. Check metrics: npm run deploy:status`);

  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    
    if (error.response?.data) {
      console.error('\nError details:', error.response.data);
    }
    
    console.log('\nTroubleshooting:');
    console.log('1. Check your API key is valid');
    console.log('2. Ensure the AppAtOnce server is running (npm run dev in appatonce/server)');
    console.log('3. Check the server logs for more details');
    
    process.exit(1);
  }
}

// Helper commands
if (process.argv[2] === 'logs') {
  // Show deployment logs
  showLogs();
} else if (process.argv[2] === 'status') {
  // Show deployment status
  showStatus();
} else {
  // Run main deployment
  main();
}

async function showLogs() {
  const deploymentId = process.env.LAST_DEPLOYMENT_ID || process.argv[3];
  if (!deploymentId) {
    console.error('Usage: node deploy-with-appatonce.js logs [deployment-id]');
    process.exit(1);
  }
  
  const apiKey = process.env.APPATONCE_API_KEY;
  if (!apiKey) {
    console.error('APPATONCE_API_KEY is required');
    process.exit(1);
  }
  
  const client = AppAtOnceClient.createWithApiKey(apiKey);
  const logs = await client.deployment.getLogs(deploymentId, { tail: 100 });
  
  console.log(`📜 Deployment logs for ${deploymentId}:\n`);
  logs.forEach(log => console.log(log));
}

async function showStatus() {
  const deploymentId = process.env.LAST_DEPLOYMENT_ID || process.argv[3];
  if (!deploymentId) {
    console.error('Usage: node deploy-with-appatonce.js status [deployment-id]');
    process.exit(1);
  }
  
  const apiKey = process.env.APPATONCE_API_KEY;
  if (!apiKey) {
    console.error('APPATONCE_API_KEY is required');
    process.exit(1);
  }
  
  const client = AppAtOnceClient.createWithApiKey(apiKey);
  const progress = await client.deployment.getProgress(deploymentId);
  
  console.log(`📊 Deployment status for ${deploymentId}:\n`);
  console.log(`   Status: ${progress.status}`);
  console.log(`   Stage: ${progress.stage}`);
  console.log(`   Progress: ${progress.progress}%`);
  if (progress.url) {
    console.log(`   URL: ${progress.url}`);
  }
  if (progress.error) {
    console.log(`   Error: ${progress.error}`);
  }
}