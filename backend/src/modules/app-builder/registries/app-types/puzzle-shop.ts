/**
 * Puzzle Shop App Type Definition
 *
 * Complete definition for puzzle shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PUZZLE_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'puzzle-shop',
  name: 'Puzzle Shop',
  category: 'retail',
  description: 'Puzzle Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "puzzle shop",
      "puzzle",
      "shop",
      "puzzle software",
      "puzzle app",
      "puzzle platform",
      "puzzle system",
      "puzzle management",
      "retail puzzle"
  ],

  synonyms: [
      "Puzzle Shop platform",
      "Puzzle Shop software",
      "Puzzle Shop system",
      "puzzle solution",
      "puzzle service"
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
      "Build a puzzle shop platform",
      "Create a puzzle shop app",
      "I need a puzzle shop management system",
      "Build a puzzle shop solution",
      "Create a puzzle shop booking system"
  ],
};
