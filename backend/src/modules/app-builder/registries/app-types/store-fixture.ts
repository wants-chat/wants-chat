/**
 * Store Fixture App Type Definition
 *
 * Complete definition for store fixture applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STORE_FIXTURE_APP_TYPE: AppTypeDefinition = {
  id: 'store-fixture',
  name: 'Store Fixture',
  category: 'retail',
  description: 'Store Fixture platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "store fixture",
      "store",
      "fixture",
      "store software",
      "store app",
      "store platform",
      "store system",
      "store management",
      "retail store"
  ],

  synonyms: [
      "Store Fixture platform",
      "Store Fixture software",
      "Store Fixture system",
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
      "Build a store fixture platform",
      "Create a store fixture app",
      "I need a store fixture management system",
      "Build a store fixture solution",
      "Create a store fixture booking system"
  ],
};
