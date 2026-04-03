/**
 * Ski Shop App Type Definition
 *
 * Complete definition for ski shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SKI_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'ski-shop',
  name: 'Ski Shop',
  category: 'retail',
  description: 'Ski Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "ski shop",
      "ski",
      "shop",
      "ski software",
      "ski app",
      "ski platform",
      "ski system",
      "ski management",
      "retail ski"
  ],

  synonyms: [
      "Ski Shop platform",
      "Ski Shop software",
      "Ski Shop system",
      "ski solution",
      "ski service"
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
      "Build a ski shop platform",
      "Create a ski shop app",
      "I need a ski shop management system",
      "Build a ski shop solution",
      "Create a ski shop booking system"
  ],
};
