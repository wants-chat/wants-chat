/**
 * Fast Food App Type Definition
 *
 * Complete definition for fast food applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FAST_FOOD_APP_TYPE: AppTypeDefinition = {
  id: 'fast-food',
  name: 'Fast Food',
  category: 'hospitality',
  description: 'Fast Food platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "fast food",
      "fast",
      "food",
      "fast software",
      "fast app",
      "fast platform",
      "fast system",
      "fast management",
      "food-beverage fast"
  ],

  synonyms: [
      "Fast Food platform",
      "Fast Food software",
      "Fast Food system",
      "fast solution",
      "fast service"
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
      "Build a fast food platform",
      "Create a fast food app",
      "I need a fast food management system",
      "Build a fast food solution",
      "Create a fast food booking system"
  ],
};
