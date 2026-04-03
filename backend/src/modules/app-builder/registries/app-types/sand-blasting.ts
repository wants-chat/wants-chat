/**
 * Sand Blasting App Type Definition
 *
 * Complete definition for sand blasting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SAND_BLASTING_APP_TYPE: AppTypeDefinition = {
  id: 'sand-blasting',
  name: 'Sand Blasting',
  category: 'services',
  description: 'Sand Blasting platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "sand blasting",
      "sand",
      "blasting",
      "sand software",
      "sand app",
      "sand platform",
      "sand system",
      "sand management",
      "services sand"
  ],

  synonyms: [
      "Sand Blasting platform",
      "Sand Blasting software",
      "Sand Blasting system",
      "sand solution",
      "sand service"
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
      "Build a sand blasting platform",
      "Create a sand blasting app",
      "I need a sand blasting management system",
      "Build a sand blasting solution",
      "Create a sand blasting booking system"
  ],
};
