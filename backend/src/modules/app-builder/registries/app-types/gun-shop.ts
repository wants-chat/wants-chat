/**
 * Gun Shop App Type Definition
 *
 * Complete definition for gun shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GUN_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'gun-shop',
  name: 'Gun Shop',
  category: 'retail',
  description: 'Gun Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "gun shop",
      "gun",
      "shop",
      "gun software",
      "gun app",
      "gun platform",
      "gun system",
      "gun management",
      "retail gun"
  ],

  synonyms: [
      "Gun Shop platform",
      "Gun Shop software",
      "Gun Shop system",
      "gun solution",
      "gun service"
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
      "Build a gun shop platform",
      "Create a gun shop app",
      "I need a gun shop management system",
      "Build a gun shop solution",
      "Create a gun shop booking system"
  ],
};
