/**
 * Soul Food App Type Definition
 *
 * Complete definition for soul food applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SOUL_FOOD_APP_TYPE: AppTypeDefinition = {
  id: 'soul-food',
  name: 'Soul Food',
  category: 'hospitality',
  description: 'Soul Food platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "soul food",
      "soul",
      "food",
      "soul software",
      "soul app",
      "soul platform",
      "soul system",
      "soul management",
      "food-beverage soul"
  ],

  synonyms: [
      "Soul Food platform",
      "Soul Food software",
      "Soul Food system",
      "soul solution",
      "soul service"
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
      "Build a soul food platform",
      "Create a soul food app",
      "I need a soul food management system",
      "Build a soul food solution",
      "Create a soul food booking system"
  ],
};
