/**
 * Sports Shop App Type Definition
 *
 * Complete definition for sports shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPORTS_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'sports-shop',
  name: 'Sports Shop',
  category: 'retail',
  description: 'Sports Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "sports shop",
      "sports",
      "shop",
      "sports software",
      "sports app",
      "sports platform",
      "sports system",
      "sports management",
      "retail sports"
  ],

  synonyms: [
      "Sports Shop platform",
      "Sports Shop software",
      "Sports Shop system",
      "sports solution",
      "sports service"
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
      "Build a sports shop platform",
      "Create a sports shop app",
      "I need a sports shop management system",
      "Build a sports shop solution",
      "Create a sports shop booking system"
  ],
};
