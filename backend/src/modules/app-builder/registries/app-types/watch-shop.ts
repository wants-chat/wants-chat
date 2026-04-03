/**
 * Watch Shop App Type Definition
 *
 * Complete definition for watch shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WATCH_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'watch-shop',
  name: 'Watch Shop',
  category: 'retail',
  description: 'Watch Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "watch shop",
      "watch",
      "shop",
      "watch software",
      "watch app",
      "watch platform",
      "watch system",
      "watch management",
      "retail watch"
  ],

  synonyms: [
      "Watch Shop platform",
      "Watch Shop software",
      "Watch Shop system",
      "watch solution",
      "watch service"
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
      "Build a watch shop platform",
      "Create a watch shop app",
      "I need a watch shop management system",
      "Build a watch shop solution",
      "Create a watch shop booking system"
  ],
};
