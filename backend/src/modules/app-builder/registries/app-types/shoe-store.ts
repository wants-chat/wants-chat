/**
 * Shoe Store App Type Definition
 *
 * Complete definition for shoe store applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SHOE_STORE_APP_TYPE: AppTypeDefinition = {
  id: 'shoe-store',
  name: 'Shoe Store',
  category: 'retail',
  description: 'Shoe Store platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "shoe store",
      "shoe",
      "store",
      "shoe software",
      "shoe app",
      "shoe platform",
      "shoe system",
      "shoe management",
      "retail shoe"
  ],

  synonyms: [
      "Shoe Store platform",
      "Shoe Store software",
      "Shoe Store system",
      "shoe solution",
      "shoe service"
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
      "Build a shoe store platform",
      "Create a shoe store app",
      "I need a shoe store management system",
      "Build a shoe store solution",
      "Create a shoe store booking system"
  ],
};
