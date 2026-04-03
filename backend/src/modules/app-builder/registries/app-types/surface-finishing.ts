/**
 * Surface Finishing App Type Definition
 *
 * Complete definition for surface finishing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SURFACE_FINISHING_APP_TYPE: AppTypeDefinition = {
  id: 'surface-finishing',
  name: 'Surface Finishing',
  category: 'services',
  description: 'Surface Finishing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "surface finishing",
      "surface",
      "finishing",
      "surface software",
      "surface app",
      "surface platform",
      "surface system",
      "surface management",
      "services surface"
  ],

  synonyms: [
      "Surface Finishing platform",
      "Surface Finishing software",
      "Surface Finishing system",
      "surface solution",
      "surface service"
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
      "Build a surface finishing platform",
      "Create a surface finishing app",
      "I need a surface finishing management system",
      "Build a surface finishing solution",
      "Create a surface finishing booking system"
  ],
};
