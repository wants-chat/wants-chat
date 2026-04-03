/**
 * Pie Shop App Type Definition
 *
 * Complete definition for pie shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PIE_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'pie-shop',
  name: 'Pie Shop',
  category: 'retail',
  description: 'Pie Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "pie shop",
      "pie",
      "shop",
      "pie software",
      "pie app",
      "pie platform",
      "pie system",
      "pie management",
      "retail pie"
  ],

  synonyms: [
      "Pie Shop platform",
      "Pie Shop software",
      "Pie Shop system",
      "pie solution",
      "pie service"
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
      "Build a pie shop platform",
      "Create a pie shop app",
      "I need a pie shop management system",
      "Build a pie shop solution",
      "Create a pie shop booking system"
  ],
};
