/**
 * Shopping Mall App Type Definition
 *
 * Complete definition for shopping mall applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SHOPPING_MALL_APP_TYPE: AppTypeDefinition = {
  id: 'shopping-mall',
  name: 'Shopping Mall',
  category: 'retail',
  description: 'Shopping Mall platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "shopping mall",
      "shopping",
      "mall",
      "shopping software",
      "shopping app",
      "shopping platform",
      "shopping system",
      "shopping management",
      "retail shopping"
  ],

  synonyms: [
      "Shopping Mall platform",
      "Shopping Mall software",
      "Shopping Mall system",
      "shopping solution",
      "shopping service"
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
      "Build a shopping mall platform",
      "Create a shopping mall app",
      "I need a shopping mall management system",
      "Build a shopping mall solution",
      "Create a shopping mall booking system"
  ],
};
