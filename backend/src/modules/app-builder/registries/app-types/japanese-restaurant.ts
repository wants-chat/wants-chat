/**
 * Japanese Restaurant App Type Definition
 *
 * Complete definition for japanese restaurant applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const JAPANESE_RESTAURANT_APP_TYPE: AppTypeDefinition = {
  id: 'japanese-restaurant',
  name: 'Japanese Restaurant',
  category: 'hospitality',
  description: 'Japanese Restaurant platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "japanese restaurant",
      "japanese",
      "restaurant",
      "japanese software",
      "japanese app",
      "japanese platform",
      "japanese system",
      "japanese management",
      "food-beverage japanese"
  ],

  synonyms: [
      "Japanese Restaurant platform",
      "Japanese Restaurant software",
      "Japanese Restaurant system",
      "japanese solution",
      "japanese service"
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
      "Build a japanese restaurant platform",
      "Create a japanese restaurant app",
      "I need a japanese restaurant management system",
      "Build a japanese restaurant solution",
      "Create a japanese restaurant booking system"
  ],
};
