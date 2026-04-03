/**
 * Sustainable Food App Type Definition
 *
 * Complete definition for sustainable food applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SUSTAINABLE_FOOD_APP_TYPE: AppTypeDefinition = {
  id: 'sustainable-food',
  name: 'Sustainable Food',
  category: 'hospitality',
  description: 'Sustainable Food platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "sustainable food",
      "sustainable",
      "food",
      "sustainable software",
      "sustainable app",
      "sustainable platform",
      "sustainable system",
      "sustainable management",
      "food-beverage sustainable"
  ],

  synonyms: [
      "Sustainable Food platform",
      "Sustainable Food software",
      "Sustainable Food system",
      "sustainable solution",
      "sustainable service"
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
      "Build a sustainable food platform",
      "Create a sustainable food app",
      "I need a sustainable food management system",
      "Build a sustainable food solution",
      "Create a sustainable food booking system"
  ],
};
