/**
 * Reptile Shop App Type Definition
 *
 * Complete definition for reptile shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const REPTILE_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'reptile-shop',
  name: 'Reptile Shop',
  category: 'retail',
  description: 'Reptile Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "reptile shop",
      "reptile",
      "shop",
      "reptile software",
      "reptile app",
      "reptile platform",
      "reptile system",
      "reptile management",
      "retail reptile"
  ],

  synonyms: [
      "Reptile Shop platform",
      "Reptile Shop software",
      "Reptile Shop system",
      "reptile solution",
      "reptile service"
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
      "Build a reptile shop platform",
      "Create a reptile shop app",
      "I need a reptile shop management system",
      "Build a reptile shop solution",
      "Create a reptile shop booking system"
  ],
};
