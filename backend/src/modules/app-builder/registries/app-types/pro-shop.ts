/**
 * Pro Shop App Type Definition
 *
 * Complete definition for pro shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PRO_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'pro-shop',
  name: 'Pro Shop',
  category: 'retail',
  description: 'Pro Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "pro shop",
      "pro",
      "shop",
      "pro software",
      "pro app",
      "pro platform",
      "pro system",
      "pro management",
      "retail pro"
  ],

  synonyms: [
      "Pro Shop platform",
      "Pro Shop software",
      "Pro Shop system",
      "pro solution",
      "pro service"
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
      "Build a pro shop platform",
      "Create a pro shop app",
      "I need a pro shop management system",
      "Build a pro shop solution",
      "Create a pro shop booking system"
  ],
};
