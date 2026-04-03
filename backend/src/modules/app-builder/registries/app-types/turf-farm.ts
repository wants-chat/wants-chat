/**
 * Turf Farm App Type Definition
 *
 * Complete definition for turf farm applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TURF_FARM_APP_TYPE: AppTypeDefinition = {
  id: 'turf-farm',
  name: 'Turf Farm',
  category: 'services',
  description: 'Turf Farm platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "turf farm",
      "turf",
      "farm",
      "turf software",
      "turf app",
      "turf platform",
      "turf system",
      "turf management",
      "services turf"
  ],

  synonyms: [
      "Turf Farm platform",
      "Turf Farm software",
      "Turf Farm system",
      "turf solution",
      "turf service"
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
      "Build a turf farm platform",
      "Create a turf farm app",
      "I need a turf farm management system",
      "Build a turf farm solution",
      "Create a turf farm booking system"
  ],
};
