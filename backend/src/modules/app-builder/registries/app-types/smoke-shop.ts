/**
 * Smoke Shop App Type Definition
 *
 * Complete definition for smoke shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SMOKE_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'smoke-shop',
  name: 'Smoke Shop',
  category: 'retail',
  description: 'Smoke Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "smoke shop",
      "smoke",
      "shop",
      "smoke software",
      "smoke app",
      "smoke platform",
      "smoke system",
      "smoke management",
      "retail smoke"
  ],

  synonyms: [
      "Smoke Shop platform",
      "Smoke Shop software",
      "Smoke Shop system",
      "smoke solution",
      "smoke service"
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
      "Build a smoke shop platform",
      "Create a smoke shop app",
      "I need a smoke shop management system",
      "Build a smoke shop solution",
      "Create a smoke shop booking system"
  ],
};
