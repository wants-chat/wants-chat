/**
 * Vegetarian Restaurant App Type Definition
 *
 * Complete definition for vegetarian restaurant applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VEGETARIAN_RESTAURANT_APP_TYPE: AppTypeDefinition = {
  id: 'vegetarian-restaurant',
  name: 'Vegetarian Restaurant',
  category: 'hospitality',
  description: 'Vegetarian Restaurant platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "vegetarian restaurant",
      "vegetarian",
      "restaurant",
      "vegetarian software",
      "vegetarian app",
      "vegetarian platform",
      "vegetarian system",
      "vegetarian management",
      "food-beverage vegetarian"
  ],

  synonyms: [
      "Vegetarian Restaurant platform",
      "Vegetarian Restaurant software",
      "Vegetarian Restaurant system",
      "vegetarian solution",
      "vegetarian service"
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
      "Build a vegetarian restaurant platform",
      "Create a vegetarian restaurant app",
      "I need a vegetarian restaurant management system",
      "Build a vegetarian restaurant solution",
      "Create a vegetarian restaurant booking system"
  ],
};
