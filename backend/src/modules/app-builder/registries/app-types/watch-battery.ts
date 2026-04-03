/**
 * Watch Battery App Type Definition
 *
 * Complete definition for watch battery applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WATCH_BATTERY_APP_TYPE: AppTypeDefinition = {
  id: 'watch-battery',
  name: 'Watch Battery',
  category: 'services',
  description: 'Watch Battery platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "watch battery",
      "watch",
      "battery",
      "watch software",
      "watch app",
      "watch platform",
      "watch system",
      "watch management",
      "services watch"
  ],

  synonyms: [
      "Watch Battery platform",
      "Watch Battery software",
      "Watch Battery system",
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
      "Build a watch battery platform",
      "Create a watch battery app",
      "I need a watch battery management system",
      "Build a watch battery solution",
      "Create a watch battery booking system"
  ],
};
