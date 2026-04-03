/**
 * Golf Shop App Type Definition
 *
 * Complete definition for golf shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GOLF_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'golf-shop',
  name: 'Golf Shop',
  category: 'retail',
  description: 'Golf Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "golf shop",
      "golf",
      "shop",
      "golf software",
      "golf app",
      "golf platform",
      "golf system",
      "golf management",
      "retail golf"
  ],

  synonyms: [
      "Golf Shop platform",
      "Golf Shop software",
      "Golf Shop system",
      "golf solution",
      "golf service"
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
      "Build a golf shop platform",
      "Create a golf shop app",
      "I need a golf shop management system",
      "Build a golf shop solution",
      "Create a golf shop booking system"
  ],
};
