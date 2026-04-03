/**
 * Generate .env.example file - Template showing all available environment variables
 * This is for documentation/reference only, not used by the app
 */
export function generateEnvFile(appId: string = 'your-app-id-here'): string {
  return `# Frontend Environment Variables Template
# Copy this to .env.local for local development

# App ID (auto-generated)
VITE_APP_ID=${appId}

# Backend API URL (set by preview service for development)
VITE_API_URL=http://localhost:4000/api/v1

# Platform API URL (for visual editor and platform features)
VITE_PLATFORM_API_URL=http://localhost:5005/api/v1
`;
}

/**
 * Generate .env.production file (created during app generation, updated during deployment)
 * This file is used by 'npm run build' for production builds
 */
export function generateEnvProductionFile(
  appId: string,
  platformApiUrl: string = process.env.PLATFORM_API_URL || 'http://localhost:5005/api/v1'
): string {
  return `# Production Environment Variables
# Used by: npm run build
# Auto-updated during deployment with deployed backend URL

# App ID
VITE_APP_ID=${appId}

# Backend API URL (will be set during deployment)
# VITE_API_URL will be automatically updated with deployed backend URL before build

# Platform API URL (for visual editor and platform features)
VITE_PLATFORM_API_URL=${platformApiUrl}
`;
}

/**
 * Generate vite-env.d.ts - TypeScript definitions for environment variables
 */
export function generateViteEnvDts(): string {
  return `/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ID: string;
  readonly VITE_API_URL: string;
  readonly VITE_PLATFORM_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}`;
}
