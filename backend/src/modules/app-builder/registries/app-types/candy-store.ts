/**
 * Candy Store App Type Definition
 *
 * Complete definition for candy store applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CANDY_STORE_APP_TYPE: AppTypeDefinition = {
  id: 'candy-store',
  name: 'Candy Store',
  category: 'retail',
  description: 'Candy Store platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "candy store",
      "candy",
      "store",
      "candy software",
      "candy app",
      "candy platform",
      "candy system",
      "candy management",
      "retail candy"
  ],

  synonyms: [
      "Candy Store platform",
      "Candy Store software",
      "Candy Store system",
      "candy solution",
      "candy service"
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
      "Build a candy store platform",
      "Create a candy store app",
      "I need a candy store management system",
      "Build a candy store solution",
      "Create a candy store booking system"
  ],
};
