/**
 * Wine Shop App Type Definition
 *
 * Complete definition for wine shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WINE_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'wine-shop',
  name: 'Wine Shop',
  category: 'retail',
  description: 'Wine Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "wine shop",
      "wine",
      "shop",
      "wine software",
      "wine app",
      "wine platform",
      "wine system",
      "wine management",
      "retail wine"
  ],

  synonyms: [
      "Wine Shop platform",
      "Wine Shop software",
      "Wine Shop system",
      "wine solution",
      "wine service"
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
      "Build a wine shop platform",
      "Create a wine shop app",
      "I need a wine shop management system",
      "Build a wine shop solution",
      "Create a wine shop booking system"
  ],
};
