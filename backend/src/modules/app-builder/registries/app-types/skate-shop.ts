/**
 * Skate Shop App Type Definition
 *
 * Complete definition for skate shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SKATE_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'skate-shop',
  name: 'Skate Shop',
  category: 'retail',
  description: 'Skate Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "skate shop",
      "skate",
      "shop",
      "skate software",
      "skate app",
      "skate platform",
      "skate system",
      "skate management",
      "retail skate"
  ],

  synonyms: [
      "Skate Shop platform",
      "Skate Shop software",
      "Skate Shop system",
      "skate solution",
      "skate service"
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
      "Build a skate shop platform",
      "Create a skate shop app",
      "I need a skate shop management system",
      "Build a skate shop solution",
      "Create a skate shop booking system"
  ],
};
