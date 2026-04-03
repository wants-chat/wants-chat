/**
 * Solution Provider App Type Definition
 *
 * Complete definition for solution provider applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SOLUTION_PROVIDER_APP_TYPE: AppTypeDefinition = {
  id: 'solution-provider',
  name: 'Solution Provider',
  category: 'services',
  description: 'Solution Provider platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "solution provider",
      "solution",
      "provider",
      "solution software",
      "solution app",
      "solution platform",
      "solution system",
      "solution management",
      "services solution"
  ],

  synonyms: [
      "Solution Provider platform",
      "Solution Provider software",
      "Solution Provider system",
      "solution solution",
      "solution service"
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
      "Build a solution provider platform",
      "Create a solution provider app",
      "I need a solution provider management system",
      "Build a solution provider solution",
      "Create a solution provider booking system"
  ],
};
