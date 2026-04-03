/**
 * Halal Food App Type Definition
 *
 * Complete definition for halal food applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HALAL_FOOD_APP_TYPE: AppTypeDefinition = {
  id: 'halal-food',
  name: 'Halal Food',
  category: 'hospitality',
  description: 'Halal Food platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "halal food",
      "halal",
      "food",
      "halal software",
      "halal app",
      "halal platform",
      "halal system",
      "halal management",
      "food-beverage halal"
  ],

  synonyms: [
      "Halal Food platform",
      "Halal Food software",
      "Halal Food system",
      "halal solution",
      "halal service"
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
      "Build a halal food platform",
      "Create a halal food app",
      "I need a halal food management system",
      "Build a halal food solution",
      "Create a halal food booking system"
  ],
};
