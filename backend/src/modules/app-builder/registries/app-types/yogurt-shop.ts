/**
 * Yogurt Shop App Type Definition
 *
 * Complete definition for yogurt shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YOGURT_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'yogurt-shop',
  name: 'Yogurt Shop',
  category: 'retail',
  description: 'Yogurt Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "yogurt shop",
      "yogurt",
      "shop",
      "yogurt software",
      "yogurt app",
      "yogurt platform",
      "yogurt system",
      "yogurt management",
      "retail yogurt"
  ],

  synonyms: [
      "Yogurt Shop platform",
      "Yogurt Shop software",
      "Yogurt Shop system",
      "yogurt solution",
      "yogurt service"
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
      "Build a yogurt shop platform",
      "Create a yogurt shop app",
      "I need a yogurt shop management system",
      "Build a yogurt shop solution",
      "Create a yogurt shop booking system"
  ],
};
