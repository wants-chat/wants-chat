/**
 * Discount Store App Type Definition
 *
 * Complete definition for discount store applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DISCOUNT_STORE_APP_TYPE: AppTypeDefinition = {
  id: 'discount-store',
  name: 'Discount Store',
  category: 'retail',
  description: 'Discount Store platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "discount store",
      "discount",
      "store",
      "discount software",
      "discount app",
      "discount platform",
      "discount system",
      "discount management",
      "retail discount"
  ],

  synonyms: [
      "Discount Store platform",
      "Discount Store software",
      "Discount Store system",
      "discount solution",
      "discount service"
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
      "Build a discount store platform",
      "Create a discount store app",
      "I need a discount store management system",
      "Build a discount store solution",
      "Create a discount store booking system"
  ],
};
