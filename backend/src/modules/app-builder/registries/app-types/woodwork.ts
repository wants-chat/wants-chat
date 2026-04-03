/**
 * Woodwork App Type Definition
 *
 * Complete definition for woodwork applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WOODWORK_APP_TYPE: AppTypeDefinition = {
  id: 'woodwork',
  name: 'Woodwork',
  category: 'services',
  description: 'Woodwork platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "woodwork",
      "woodwork software",
      "woodwork app",
      "woodwork platform",
      "woodwork system",
      "woodwork management",
      "services woodwork"
  ],

  synonyms: [
      "Woodwork platform",
      "Woodwork software",
      "Woodwork system",
      "woodwork solution",
      "woodwork service"
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
      "Build a woodwork platform",
      "Create a woodwork app",
      "I need a woodwork management system",
      "Build a woodwork solution",
      "Create a woodwork booking system"
  ],
};
