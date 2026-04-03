/**
 * Mortuary App Type Definition
 *
 * Complete definition for mortuary applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MORTUARY_APP_TYPE: AppTypeDefinition = {
  id: 'mortuary',
  name: 'Mortuary',
  category: 'services',
  description: 'Mortuary platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "mortuary",
      "mortuary software",
      "mortuary app",
      "mortuary platform",
      "mortuary system",
      "mortuary management",
      "services mortuary"
  ],

  synonyms: [
      "Mortuary platform",
      "Mortuary software",
      "Mortuary system",
      "mortuary solution",
      "mortuary service"
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
      "Build a mortuary platform",
      "Create a mortuary app",
      "I need a mortuary management system",
      "Build a mortuary solution",
      "Create a mortuary booking system"
  ],
};
