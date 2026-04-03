/**
 * Watch Maker App Type Definition
 *
 * Complete definition for watch maker applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WATCH_MAKER_APP_TYPE: AppTypeDefinition = {
  id: 'watch-maker',
  name: 'Watch Maker',
  category: 'services',
  description: 'Watch Maker platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "watch maker",
      "watch",
      "maker",
      "watch software",
      "watch app",
      "watch platform",
      "watch system",
      "watch management",
      "services watch"
  ],

  synonyms: [
      "Watch Maker platform",
      "Watch Maker software",
      "Watch Maker system",
      "watch solution",
      "watch service"
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
      "Build a watch maker platform",
      "Create a watch maker app",
      "I need a watch maker management system",
      "Build a watch maker solution",
      "Create a watch maker booking system"
  ],
};
