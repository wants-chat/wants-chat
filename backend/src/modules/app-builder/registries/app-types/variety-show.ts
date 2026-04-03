/**
 * Variety Show App Type Definition
 *
 * Complete definition for variety show applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VARIETY_SHOW_APP_TYPE: AppTypeDefinition = {
  id: 'variety-show',
  name: 'Variety Show',
  category: 'services',
  description: 'Variety Show platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "variety show",
      "variety",
      "show",
      "variety software",
      "variety app",
      "variety platform",
      "variety system",
      "variety management",
      "services variety"
  ],

  synonyms: [
      "Variety Show platform",
      "Variety Show software",
      "Variety Show system",
      "variety solution",
      "variety service"
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
      "Build a variety show platform",
      "Create a variety show app",
      "I need a variety show management system",
      "Build a variety show solution",
      "Create a variety show booking system"
  ],
};
