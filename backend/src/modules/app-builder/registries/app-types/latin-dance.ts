/**
 * Latin Dance App Type Definition
 *
 * Complete definition for latin dance applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LATIN_DANCE_APP_TYPE: AppTypeDefinition = {
  id: 'latin-dance',
  name: 'Latin Dance',
  category: 'services',
  description: 'Latin Dance platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "latin dance",
      "latin",
      "dance",
      "latin software",
      "latin app",
      "latin platform",
      "latin system",
      "latin management",
      "services latin"
  ],

  synonyms: [
      "Latin Dance platform",
      "Latin Dance software",
      "Latin Dance system",
      "latin solution",
      "latin service"
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
      "Build a latin dance platform",
      "Create a latin dance app",
      "I need a latin dance management system",
      "Build a latin dance solution",
      "Create a latin dance booking system"
  ],
};
