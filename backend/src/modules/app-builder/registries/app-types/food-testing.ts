/**
 * Food Testing App Type Definition
 *
 * Complete definition for food testing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FOOD_TESTING_APP_TYPE: AppTypeDefinition = {
  id: 'food-testing',
  name: 'Food Testing',
  category: 'hospitality',
  description: 'Food Testing platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "food testing",
      "food",
      "testing",
      "food software",
      "food app",
      "food platform",
      "food system",
      "food management",
      "food-beverage food"
  ],

  synonyms: [
      "Food Testing platform",
      "Food Testing software",
      "Food Testing system",
      "food solution",
      "food service"
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
      "Build a food testing platform",
      "Create a food testing app",
      "I need a food testing management system",
      "Build a food testing solution",
      "Create a food testing booking system"
  ],
};
