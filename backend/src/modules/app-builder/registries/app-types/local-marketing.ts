/**
 * Local Marketing App Type Definition
 *
 * Complete definition for local marketing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LOCAL_MARKETING_APP_TYPE: AppTypeDefinition = {
  id: 'local-marketing',
  name: 'Local Marketing',
  category: 'retail',
  description: 'Local Marketing platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "local marketing",
      "local",
      "marketing",
      "local software",
      "local app",
      "local platform",
      "local system",
      "local management",
      "retail local"
  ],

  synonyms: [
      "Local Marketing platform",
      "Local Marketing software",
      "Local Marketing system",
      "local solution",
      "local service"
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
      "Build a local marketing platform",
      "Create a local marketing app",
      "I need a local marketing management system",
      "Build a local marketing solution",
      "Create a local marketing booking system"
  ],
};
