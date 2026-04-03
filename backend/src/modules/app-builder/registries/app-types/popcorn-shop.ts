/**
 * Popcorn Shop App Type Definition
 *
 * Complete definition for popcorn shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const POPCORN_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'popcorn-shop',
  name: 'Popcorn Shop',
  category: 'retail',
  description: 'Popcorn Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "popcorn shop",
      "popcorn",
      "shop",
      "popcorn software",
      "popcorn app",
      "popcorn platform",
      "popcorn system",
      "popcorn management",
      "retail popcorn"
  ],

  synonyms: [
      "Popcorn Shop platform",
      "Popcorn Shop software",
      "Popcorn Shop system",
      "popcorn solution",
      "popcorn service"
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
      "Build a popcorn shop platform",
      "Create a popcorn shop app",
      "I need a popcorn shop management system",
      "Build a popcorn shop solution",
      "Create a popcorn shop booking system"
  ],
};
