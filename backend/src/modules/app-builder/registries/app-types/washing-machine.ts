/**
 * Washing Machine App Type Definition
 *
 * Complete definition for washing machine applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WASHING_MACHINE_APP_TYPE: AppTypeDefinition = {
  id: 'washing-machine',
  name: 'Washing Machine',
  category: 'services',
  description: 'Washing Machine platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "washing machine",
      "washing",
      "machine",
      "washing software",
      "washing app",
      "washing platform",
      "washing system",
      "washing management",
      "services washing"
  ],

  synonyms: [
      "Washing Machine platform",
      "Washing Machine software",
      "Washing Machine system",
      "washing solution",
      "washing service"
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
      "Build a washing machine platform",
      "Create a washing machine app",
      "I need a washing machine management system",
      "Build a washing machine solution",
      "Create a washing machine booking system"
  ],
};
