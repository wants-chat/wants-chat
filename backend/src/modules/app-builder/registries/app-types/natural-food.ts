/**
 * Natural Food App Type Definition
 *
 * Complete definition for natural food applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const NATURAL_FOOD_APP_TYPE: AppTypeDefinition = {
  id: 'natural-food',
  name: 'Natural Food',
  category: 'hospitality',
  description: 'Natural Food platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "natural food",
      "natural",
      "food",
      "natural software",
      "natural app",
      "natural platform",
      "natural system",
      "natural management",
      "food-beverage natural"
  ],

  synonyms: [
      "Natural Food platform",
      "Natural Food software",
      "Natural Food system",
      "natural solution",
      "natural service"
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
      "Build a natural food platform",
      "Create a natural food app",
      "I need a natural food management system",
      "Build a natural food solution",
      "Create a natural food booking system"
  ],
};
