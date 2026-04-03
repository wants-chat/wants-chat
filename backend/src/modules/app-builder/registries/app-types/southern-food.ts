/**
 * Southern Food App Type Definition
 *
 * Complete definition for southern food applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SOUTHERN_FOOD_APP_TYPE: AppTypeDefinition = {
  id: 'southern-food',
  name: 'Southern Food',
  category: 'hospitality',
  description: 'Southern Food platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "southern food",
      "southern",
      "food",
      "southern software",
      "southern app",
      "southern platform",
      "southern system",
      "southern management",
      "food-beverage southern"
  ],

  synonyms: [
      "Southern Food platform",
      "Southern Food software",
      "Southern Food system",
      "southern solution",
      "southern service"
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
      "Build a southern food platform",
      "Create a southern food app",
      "I need a southern food management system",
      "Build a southern food solution",
      "Create a southern food booking system"
  ],
};
