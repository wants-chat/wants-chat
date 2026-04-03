/**
 * Mining App Type Definition
 *
 * Complete definition for mining applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MINING_APP_TYPE: AppTypeDefinition = {
  id: 'mining',
  name: 'Mining',
  category: 'services',
  description: 'Mining platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "mining",
      "mining software",
      "mining app",
      "mining platform",
      "mining system",
      "mining management",
      "services mining"
  ],

  synonyms: [
      "Mining platform",
      "Mining software",
      "Mining system",
      "mining solution",
      "mining service"
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
      "Build a mining platform",
      "Create a mining app",
      "I need a mining management system",
      "Build a mining solution",
      "Create a mining booking system"
  ],
};
