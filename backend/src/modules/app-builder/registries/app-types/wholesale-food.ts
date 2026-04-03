/**
 * Wholesale Food App Type Definition
 *
 * Complete definition for wholesale food applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WHOLESALE_FOOD_APP_TYPE: AppTypeDefinition = {
  id: 'wholesale-food',
  name: 'Wholesale Food',
  category: 'hospitality',
  description: 'Wholesale Food platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "wholesale food",
      "wholesale",
      "food",
      "wholesale software",
      "wholesale app",
      "wholesale platform",
      "wholesale system",
      "wholesale management",
      "food-beverage wholesale"
  ],

  synonyms: [
      "Wholesale Food platform",
      "Wholesale Food software",
      "Wholesale Food system",
      "wholesale solution",
      "wholesale service"
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
      "Build a wholesale food platform",
      "Create a wholesale food app",
      "I need a wholesale food management system",
      "Build a wholesale food solution",
      "Create a wholesale food booking system"
  ],
};
