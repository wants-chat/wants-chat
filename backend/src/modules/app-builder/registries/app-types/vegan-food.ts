/**
 * Vegan Food App Type Definition
 *
 * Complete definition for vegan food applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VEGAN_FOOD_APP_TYPE: AppTypeDefinition = {
  id: 'vegan-food',
  name: 'Vegan Food',
  category: 'hospitality',
  description: 'Vegan Food platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "vegan food",
      "vegan",
      "food",
      "vegan software",
      "vegan app",
      "vegan platform",
      "vegan system",
      "vegan management",
      "food-beverage vegan"
  ],

  synonyms: [
      "Vegan Food platform",
      "Vegan Food software",
      "Vegan Food system",
      "vegan solution",
      "vegan service"
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
      "Build a vegan food platform",
      "Create a vegan food app",
      "I need a vegan food management system",
      "Build a vegan food solution",
      "Create a vegan food booking system"
  ],
};
