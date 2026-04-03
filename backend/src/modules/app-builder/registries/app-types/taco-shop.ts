/**
 * Taco Shop App Type Definition
 *
 * Complete definition for taco shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TACO_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'taco-shop',
  name: 'Taco Shop',
  category: 'retail',
  description: 'Taco Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "taco shop",
      "taco",
      "shop",
      "taco software",
      "taco app",
      "taco platform",
      "taco system",
      "taco management",
      "retail taco"
  ],

  synonyms: [
      "Taco Shop platform",
      "Taco Shop software",
      "Taco Shop system",
      "taco solution",
      "taco service"
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
      "Build a taco shop platform",
      "Create a taco shop app",
      "I need a taco shop management system",
      "Build a taco shop solution",
      "Create a taco shop booking system"
  ],
};
