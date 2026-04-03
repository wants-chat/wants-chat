/**
 * Knitting Shop App Type Definition
 *
 * Complete definition for knitting shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const KNITTING_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'knitting-shop',
  name: 'Knitting Shop',
  category: 'retail',
  description: 'Knitting Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "knitting shop",
      "knitting",
      "shop",
      "knitting software",
      "knitting app",
      "knitting platform",
      "knitting system",
      "knitting management",
      "retail knitting"
  ],

  synonyms: [
      "Knitting Shop platform",
      "Knitting Shop software",
      "Knitting Shop system",
      "knitting solution",
      "knitting service"
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
      "Build a knitting shop platform",
      "Create a knitting shop app",
      "I need a knitting shop management system",
      "Build a knitting shop solution",
      "Create a knitting shop booking system"
  ],
};
