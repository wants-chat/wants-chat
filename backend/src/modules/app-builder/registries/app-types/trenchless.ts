/**
 * Trenchless App Type Definition
 *
 * Complete definition for trenchless applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRENCHLESS_APP_TYPE: AppTypeDefinition = {
  id: 'trenchless',
  name: 'Trenchless',
  category: 'services',
  description: 'Trenchless platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "trenchless",
      "trenchless software",
      "trenchless app",
      "trenchless platform",
      "trenchless system",
      "trenchless management",
      "services trenchless"
  ],

  synonyms: [
      "Trenchless platform",
      "Trenchless software",
      "Trenchless system",
      "trenchless solution",
      "trenchless service"
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
      "Build a trenchless platform",
      "Create a trenchless app",
      "I need a trenchless management system",
      "Build a trenchless solution",
      "Create a trenchless booking system"
  ],
};
