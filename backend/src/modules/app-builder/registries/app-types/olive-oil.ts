/**
 * Olive Oil App Type Definition
 *
 * Complete definition for olive oil applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const OLIVE_OIL_APP_TYPE: AppTypeDefinition = {
  id: 'olive-oil',
  name: 'Olive Oil',
  category: 'services',
  description: 'Olive Oil platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "olive oil",
      "olive",
      "oil",
      "olive software",
      "olive app",
      "olive platform",
      "olive system",
      "olive management",
      "services olive"
  ],

  synonyms: [
      "Olive Oil platform",
      "Olive Oil software",
      "Olive Oil system",
      "olive solution",
      "olive service"
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
      "Build a olive oil platform",
      "Create a olive oil app",
      "I need a olive oil management system",
      "Build a olive oil solution",
      "Create a olive oil booking system"
  ],
};
