/**
 * Tint Shop App Type Definition
 *
 * Complete definition for tint shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TINT_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'tint-shop',
  name: 'Tint Shop',
  category: 'retail',
  description: 'Tint Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "tint shop",
      "tint",
      "shop",
      "tint software",
      "tint app",
      "tint platform",
      "tint system",
      "tint management",
      "retail tint"
  ],

  synonyms: [
      "Tint Shop platform",
      "Tint Shop software",
      "Tint Shop system",
      "tint solution",
      "tint service"
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
      "Build a tint shop platform",
      "Create a tint shop app",
      "I need a tint shop management system",
      "Build a tint shop solution",
      "Create a tint shop booking system"
  ],
};
