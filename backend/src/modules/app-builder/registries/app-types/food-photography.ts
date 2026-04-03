/**
 * Food Photography App Type Definition
 *
 * Complete definition for food photography applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FOOD_PHOTOGRAPHY_APP_TYPE: AppTypeDefinition = {
  id: 'food-photography',
  name: 'Food Photography',
  category: 'hospitality',
  description: 'Food Photography platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "food photography",
      "food",
      "photography",
      "food software",
      "food app",
      "food platform",
      "food system",
      "food management",
      "food-beverage food"
  ],

  synonyms: [
      "Food Photography platform",
      "Food Photography software",
      "Food Photography system",
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
      "Build a food photography platform",
      "Create a food photography app",
      "I need a food photography management system",
      "Build a food photography solution",
      "Create a food photography booking system"
  ],
};
