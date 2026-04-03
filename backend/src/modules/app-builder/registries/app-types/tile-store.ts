/**
 * Tile Store App Type Definition
 *
 * Complete definition for tile store applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TILE_STORE_APP_TYPE: AppTypeDefinition = {
  id: 'tile-store',
  name: 'Tile Store',
  category: 'retail',
  description: 'Tile Store platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "tile store",
      "tile",
      "store",
      "tile software",
      "tile app",
      "tile platform",
      "tile system",
      "tile management",
      "retail tile"
  ],

  synonyms: [
      "Tile Store platform",
      "Tile Store software",
      "Tile Store system",
      "tile solution",
      "tile service"
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
      "Build a tile store platform",
      "Create a tile store app",
      "I need a tile store management system",
      "Build a tile store solution",
      "Create a tile store booking system"
  ],
};
