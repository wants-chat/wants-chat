/**
 * Dollar Store App Type Definition
 *
 * Complete definition for dollar store applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DOLLAR_STORE_APP_TYPE: AppTypeDefinition = {
  id: 'dollar-store',
  name: 'Dollar Store',
  category: 'retail',
  description: 'Dollar Store platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "dollar store",
      "dollar",
      "store",
      "dollar software",
      "dollar app",
      "dollar platform",
      "dollar system",
      "dollar management",
      "retail dollar"
  ],

  synonyms: [
      "Dollar Store platform",
      "Dollar Store software",
      "Dollar Store system",
      "dollar solution",
      "dollar service"
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
      "inventory",
      "pos-system",
      "orders",
      "notifications"
  ],

  optionalFeatures: [
      "shopping-cart",
      "checkout",
      "payments",
      "discounts",
      "reviews"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'retail',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'clean',

  examplePrompts: [
      "Build a dollar store platform",
      "Create a dollar store app",
      "I need a dollar store management system",
      "Build a dollar store solution",
      "Create a dollar store booking system"
  ],
};
