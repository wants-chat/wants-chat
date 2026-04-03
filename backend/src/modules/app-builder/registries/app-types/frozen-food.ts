/**
 * Frozen Food App Type Definition
 *
 * Complete definition for frozen food applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FROZEN_FOOD_APP_TYPE: AppTypeDefinition = {
  id: 'frozen-food',
  name: 'Frozen Food',
  category: 'hospitality',
  description: 'Frozen Food platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "frozen food",
      "frozen",
      "food",
      "frozen software",
      "frozen app",
      "frozen platform",
      "frozen system",
      "frozen management",
      "food-beverage frozen"
  ],

  synonyms: [
      "Frozen Food platform",
      "Frozen Food software",
      "Frozen Food system",
      "frozen solution",
      "frozen service"
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
      "Build a frozen food platform",
      "Create a frozen food app",
      "I need a frozen food management system",
      "Build a frozen food solution",
      "Create a frozen food booking system"
  ],
};
