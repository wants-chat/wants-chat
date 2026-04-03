/**
 * Store Front App Type Definition
 *
 * Complete definition for store front applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STORE_FRONT_APP_TYPE: AppTypeDefinition = {
  id: 'store-front',
  name: 'Store Front',
  category: 'retail',
  description: 'Store Front platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "store front",
      "store",
      "front",
      "store software",
      "store app",
      "store platform",
      "store system",
      "store management",
      "retail store"
  ],

  synonyms: [
      "Store Front platform",
      "Store Front software",
      "Store Front system",
      "store solution",
      "store service"
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
      "Build a store front platform",
      "Create a store front app",
      "I need a store front management system",
      "Build a store front solution",
      "Create a store front booking system"
  ],
};
