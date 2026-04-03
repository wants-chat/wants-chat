/**
 * White Water App Type Definition
 *
 * Complete definition for white water applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WHITE_WATER_APP_TYPE: AppTypeDefinition = {
  id: 'white-water',
  name: 'White Water',
  category: 'services',
  description: 'White Water platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "white water",
      "white",
      "water",
      "white software",
      "white app",
      "white platform",
      "white system",
      "white management",
      "services white"
  ],

  synonyms: [
      "White Water platform",
      "White Water software",
      "White Water system",
      "white solution",
      "white service"
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
      "Build a white water platform",
      "Create a white water app",
      "I need a white water management system",
      "Build a white water solution",
      "Create a white water booking system"
  ],
};
