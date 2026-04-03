/**
 * Storm Windows App Type Definition
 *
 * Complete definition for storm windows applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STORM_WINDOWS_APP_TYPE: AppTypeDefinition = {
  id: 'storm-windows',
  name: 'Storm Windows',
  category: 'services',
  description: 'Storm Windows platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "storm windows",
      "storm",
      "windows",
      "storm software",
      "storm app",
      "storm platform",
      "storm system",
      "storm management",
      "services storm"
  ],

  synonyms: [
      "Storm Windows platform",
      "Storm Windows software",
      "Storm Windows system",
      "storm solution",
      "storm service"
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
      "Build a storm windows platform",
      "Create a storm windows app",
      "I need a storm windows management system",
      "Build a storm windows solution",
      "Create a storm windows booking system"
  ],
};
