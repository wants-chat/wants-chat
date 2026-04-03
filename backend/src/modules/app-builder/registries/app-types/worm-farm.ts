/**
 * Worm Farm App Type Definition
 *
 * Complete definition for worm farm applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WORM_FARM_APP_TYPE: AppTypeDefinition = {
  id: 'worm-farm',
  name: 'Worm Farm',
  category: 'services',
  description: 'Worm Farm platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "worm farm",
      "worm",
      "farm",
      "worm software",
      "worm app",
      "worm platform",
      "worm system",
      "worm management",
      "services worm"
  ],

  synonyms: [
      "Worm Farm platform",
      "Worm Farm software",
      "Worm Farm system",
      "worm solution",
      "worm service"
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
      "Build a worm farm platform",
      "Create a worm farm app",
      "I need a worm farm management system",
      "Build a worm farm solution",
      "Create a worm farm booking system"
  ],
};
