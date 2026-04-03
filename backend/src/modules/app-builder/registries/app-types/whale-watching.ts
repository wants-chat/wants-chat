/**
 * Whale Watching App Type Definition
 *
 * Complete definition for whale watching applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WHALE_WATCHING_APP_TYPE: AppTypeDefinition = {
  id: 'whale-watching',
  name: 'Whale Watching',
  category: 'services',
  description: 'Whale Watching platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "whale watching",
      "whale",
      "watching",
      "whale software",
      "whale app",
      "whale platform",
      "whale system",
      "whale management",
      "services whale"
  ],

  synonyms: [
      "Whale Watching platform",
      "Whale Watching software",
      "Whale Watching system",
      "whale solution",
      "whale service"
  ],

  negativeKeywords: ['blog', 'portfolio'],

  sections: [
      {
          "id": "frontend",
          "name": "Public Portal",
          "enabled": true,
          "basePath": "/",
          "layout": "public",
          "description": "Public-facing interface"
      },
      {
          "id": "admin",
          "name": "Admin Dashboard",
          "enabled": true,
          "basePath": "/admin",
          "requiredRole": "staff",
          "layout": "admin",
          "description": "Administrative interface"
      }
  ],

  roles: [
      {
          "id": "admin",
          "name": "Administrator",
          "level": 100,
          "isDefault": false,
          "accessibleSections": [
              "frontend",
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "staff",
          "name": "Staff",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "User",
          "level": 10,
          "isDefault": true,
          "accessibleSections": [
              "frontend"
          ],
          "defaultRoute": "/"
      }
  ],

  defaultFeatures: [
      "user-auth",
      "appointments",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a whale watching platform",
      "Create a whale watching app",
      "I need a whale watching management system",
      "Build a whale watching solution",
      "Create a whale watching booking system"
  ],
};
