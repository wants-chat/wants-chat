/**
 * Bail Bonds App Type Definition
 *
 * Complete definition for bail bonds applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BAIL_BONDS_APP_TYPE: AppTypeDefinition = {
  id: 'bail-bonds',
  name: 'Bail Bonds',
  category: 'services',
  description: 'Bail Bonds platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "bail bonds",
      "bail",
      "bonds",
      "bail software",
      "bail app",
      "bail platform",
      "bail system",
      "bail management",
      "services bail"
  ],

  synonyms: [
      "Bail Bonds platform",
      "Bail Bonds software",
      "Bail Bonds system",
      "bail solution",
      "bail service"
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
      "Build a bail bonds platform",
      "Create a bail bonds app",
      "I need a bail bonds management system",
      "Build a bail bonds solution",
      "Create a bail bonds booking system"
  ],
};
