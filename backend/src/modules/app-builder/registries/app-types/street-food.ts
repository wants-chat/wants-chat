/**
 * Street Food App Type Definition
 *
 * Complete definition for street food applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STREET_FOOD_APP_TYPE: AppTypeDefinition = {
  id: 'street-food',
  name: 'Street Food',
  category: 'hospitality',
  description: 'Street Food platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "street food",
      "street",
      "food",
      "street software",
      "street app",
      "street platform",
      "street system",
      "street management",
      "food-beverage street"
  ],

  synonyms: [
      "Street Food platform",
      "Street Food software",
      "Street Food system",
      "street solution",
      "street service"
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
      "Build a street food platform",
      "Create a street food app",
      "I need a street food management system",
      "Build a street food solution",
      "Create a street food booking system"
  ],
};
