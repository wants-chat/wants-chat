/**
 * AppAtOnce Deployment Configuration
 * 
 * This file configures how your life-os-backend will be deployed using the AppAtOnce SDK
 * The SDK will auto-detect most settings, but you can override them here
 */

module.exports = {
  // Project metadata (auto-detected but can be overridden)
  project: {
    name: 'life-os-backend',
    type: 'nestjs', // auto-detected
    framework: 'NestJS', // auto-detected
    language: 'TypeScript', // auto-detected
  },
  
  // Build configuration
  build: {
    command: 'npm run build',
    outputDir: 'dist',
    // Files to include in deployment
    include: [
      'dist/**/*',
      'package.json',
      'package-lock.json',
      '.env.production', // if exists
      'public/**/*', // if exists
    ],
    // Files to exclude from deployment
    exclude: [
      'node_modules',
      '.git',
      '.env.local',
      '*.log',
      'tests',
      '*.test.js',
      '*.spec.js',
    ],
  },
  
  // Runtime configuration
  runtime: {
    nodeVersion: '18', // or '16', '20'
    port: process.env.PORT || 3000,
    startCommand: 'npm run start:prod',
    // Optional: custom Dockerfile path if you have one
    // dockerfile: './Dockerfile',
  },
  
  // Database migration configuration
  migrations: {
    enabled: true,
    // Using AppAtOnce schema migration
    command: 'npx appatonce migrate dist/src/database/schema.js',
    // Run migrations before starting the app
    runBeforeStart: true,
  },
  
  // Deployment configuration
  deployment: {
    // Auto-scaling configuration
    scaling: {
      minInstances: 0, // Scale to zero for cost savings
      maxInstances: 10,
      targetCPU: 80, // Scale up when CPU > 80%
      targetMemory: 80, // Scale up when memory > 80%
    },
    
    // Resource allocation
    resources: {
      memory: '512Mi', // 512MB for free tier
      cpu: '1', // 1 vCPU
    },
    
    // Health check configuration
    healthCheck: {
      path: '/health',
      interval: 30, // seconds
      timeout: 10, // seconds
      unhealthyThreshold: 3,
      healthyThreshold: 2,
    },
    
    // Deployment strategy
    strategy: {
      type: 'rolling', // or 'blue-green', 'canary'
      maxSurge: 1,
      maxUnavailable: 0,
    },
  },
  
  // Platform-specific configurations
  platforms: {
    'google-cloud-run': {
      projectId: process.env.GCP_PROJECT_ID,
      region: process.env.GCP_REGION || 'us-central1',
      // Service account for deployment (optional)
      serviceAccount: process.env.GCP_SERVICE_ACCOUNT,
      // VPC connector for private resources (optional)
      vpcConnector: process.env.GCP_VPC_CONNECTOR,
      // Allow unauthenticated requests (for public APIs)
      allowUnauthenticated: true,
    },
    'cloudflare-pages': {
      // For frontend deployments
      accountId: process.env.CF_ACCOUNT_ID,
      projectName: 'life-os-frontend',
    },
    'railway': {
      // Railway.app configuration
      projectId: process.env.RAILWAY_PROJECT_ID,
    },
    'fly-io': {
      // Fly.io configuration
      app: process.env.FLY_APP_NAME,
      region: process.env.FLY_REGION || 'ord', // Chicago
    },
  },
  
  // Environment variables (will be encrypted during deployment)
  environmentVariables: {
    // These will be injected into your deployed application
    NODE_ENV: 'production',
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    // Add other production env vars here
    // REDIS_URL: process.env.REDIS_URL,
    // SMTP_HOST: process.env.SMTP_HOST,
    // etc.
  },
  
  // Monitoring and logging
  monitoring: {
    // Enable application performance monitoring
    apm: true,
    // Enable error tracking
    errorTracking: true,
    // Log level
    logLevel: 'info', // 'debug', 'info', 'warn', 'error'
  },
  
  // Security configuration
  security: {
    // Enable HTTPS redirect
    forceHTTPS: true,
    // Rate limiting
    rateLimit: {
      enabled: true,
      requests: 100,
      window: '1m', // 1 minute
    },
    // CORS configuration
    cors: {
      enabled: true,
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    },
  },
  
  // Custom domain configuration
  domain: {
    // Your custom domain (optional)
    custom: process.env.CUSTOM_DOMAIN,
    // SSL certificate (auto-provisioned if not specified)
    ssl: 'auto',
  },
  
  // Hooks for custom logic
  hooks: {
    // Run before deployment
    preDeploy: async () => {
      console.log('Running pre-deployment checks...');
      // Add custom pre-deployment logic here
      // e.g., run tests, validate environment, etc.
    },
    
    // Run after successful deployment
    postDeploy: async (deployment) => {
      console.log(`Deployment successful: ${deployment.url}`);
      // Add custom post-deployment logic here
      // e.g., send notifications, update DNS, warm up cache, etc.
    },
    
    // Run on deployment failure
    onError: async (error) => {
      console.error('Deployment failed:', error);
      // Add custom error handling here
      // e.g., send alerts, rollback, etc.
    },
  },
};