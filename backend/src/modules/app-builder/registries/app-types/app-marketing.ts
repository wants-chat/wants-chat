/**
 * App Marketing App Type Definition
 *
 * Complete definition for app marketing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const APP_MARKETING_APP_TYPE: AppTypeDefinition = {
  id: 'app-marketing',
  name: 'App Marketing',
  category: 'retail',
  description: 'App Marketing platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "app marketing",
      "app",
      "marketing",
      "app software",
      "app app",
      "app platform",
      "app system",
      "app management",
      "retail app"
  ],

  synonyms: [
      "App Marketing platform",
      "App Marketing software",
      "App Marketing system",
      "app solution",
      "app service"
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
      "product-catalog",
      "orders",
      "pos-system",
      "inventory",
      "notifications"
  ],

  optionalFeatures: [
      "payments",
      "discounts",
      "reviews",
      "analytics",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'retail',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'clean',

  examplePrompts: [
      "Build a app marketing platform",
      "Create a app marketing app",
      "I need a app marketing management system",
      "Build a app marketing solution",
      "Create a app marketing booking system"
  ],
};
