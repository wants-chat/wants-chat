/**
 * Food Manufacturing App Type Definition
 *
 * Complete definition for food manufacturing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FOOD_MANUFACTURING_APP_TYPE: AppTypeDefinition = {
  id: 'food-manufacturing',
  name: 'Food Manufacturing',
  category: 'hospitality',
  description: 'Food Manufacturing platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "food manufacturing",
      "food",
      "manufacturing",
      "food software",
      "food app",
      "food platform",
      "food system",
      "food management",
      "food-beverage food"
  ],

  synonyms: [
      "Food Manufacturing platform",
      "Food Manufacturing software",
      "Food Manufacturing system",
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
      "Build a food manufacturing platform",
      "Create a food manufacturing app",
      "I need a food manufacturing management system",
      "Build a food manufacturing solution",
      "Create a food manufacturing booking system"
  ],
};
