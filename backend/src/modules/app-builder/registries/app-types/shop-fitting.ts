/**
 * Shop Fitting App Type Definition
 *
 * Complete definition for shop fitting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SHOP_FITTING_APP_TYPE: AppTypeDefinition = {
  id: 'shop-fitting',
  name: 'Shop Fitting',
  category: 'retail',
  description: 'Shop Fitting platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "shop fitting",
      "shop",
      "fitting",
      "shop software",
      "shop app",
      "shop platform",
      "shop system",
      "shop management",
      "retail shop"
  ],

  synonyms: [
      "Shop Fitting platform",
      "Shop Fitting software",
      "Shop Fitting system",
      "shop solution",
      "shop service"
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
      "Build a shop fitting platform",
      "Create a shop fitting app",
      "I need a shop fitting management system",
      "Build a shop fitting solution",
      "Create a shop fitting booking system"
  ],
};
