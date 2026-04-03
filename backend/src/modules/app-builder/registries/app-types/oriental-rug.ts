/**
 * Oriental Rug App Type Definition
 *
 * Complete definition for oriental rug applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ORIENTAL_RUG_APP_TYPE: AppTypeDefinition = {
  id: 'oriental-rug',
  name: 'Oriental Rug',
  category: 'services',
  description: 'Oriental Rug platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "oriental rug",
      "oriental",
      "rug",
      "oriental software",
      "oriental app",
      "oriental platform",
      "oriental system",
      "oriental management",
      "services oriental"
  ],

  synonyms: [
      "Oriental Rug platform",
      "Oriental Rug software",
      "Oriental Rug system",
      "oriental solution",
      "oriental service"
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
      "Build a oriental rug platform",
      "Create a oriental rug app",
      "I need a oriental rug management system",
      "Build a oriental rug solution",
      "Create a oriental rug booking system"
  ],
};
