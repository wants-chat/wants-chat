/**
 * Sit Down Restaurant App Type Definition
 *
 * Complete definition for sit down restaurant applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SIT_DOWN_RESTAURANT_APP_TYPE: AppTypeDefinition = {
  id: 'sit-down-restaurant',
  name: 'Sit Down Restaurant',
  category: 'hospitality',
  description: 'Sit Down Restaurant platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "sit down restaurant",
      "sit",
      "down",
      "restaurant",
      "sit software",
      "sit app",
      "sit platform",
      "sit system",
      "sit management",
      "food-beverage sit"
  ],

  synonyms: [
      "Sit Down Restaurant platform",
      "Sit Down Restaurant software",
      "Sit Down Restaurant system",
      "sit solution",
      "sit service"
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
      "Build a sit down restaurant platform",
      "Create a sit down restaurant app",
      "I need a sit down restaurant management system",
      "Build a sit down restaurant solution",
      "Create a sit down restaurant booking system"
  ],
};
