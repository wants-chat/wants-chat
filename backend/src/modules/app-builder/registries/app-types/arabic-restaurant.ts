/**
 * Arabic Restaurant App Type Definition
 *
 * Complete definition for arabic restaurant applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ARABIC_RESTAURANT_APP_TYPE: AppTypeDefinition = {
  id: 'arabic-restaurant',
  name: 'Arabic Restaurant',
  category: 'hospitality',
  description: 'Arabic Restaurant platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "arabic restaurant",
      "arabic",
      "restaurant",
      "arabic software",
      "arabic app",
      "arabic platform",
      "arabic system",
      "arabic management",
      "food-beverage arabic"
  ],

  synonyms: [
      "Arabic Restaurant platform",
      "Arabic Restaurant software",
      "Arabic Restaurant system",
      "arabic solution",
      "arabic service"
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
          "name": "Owner",
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
          "name": "Customer",
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
      "table-reservations",
      "menu-management",
      "food-ordering",
      "pos-system",
      "notifications"
  ],

  optionalFeatures: [
      "kitchen-display",
      "payments",
      "reviews",
      "discounts"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'food-beverage',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a arabic restaurant platform",
      "Create a arabic restaurant app",
      "I need a arabic restaurant management system",
      "Build a arabic restaurant solution",
      "Create a arabic restaurant booking system"
  ],
};
