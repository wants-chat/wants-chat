/**
 * American Restaurant App Type Definition
 *
 * Complete definition for american restaurant applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AMERICAN_RESTAURANT_APP_TYPE: AppTypeDefinition = {
  id: 'american-restaurant',
  name: 'American Restaurant',
  category: 'hospitality',
  description: 'American Restaurant platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "american restaurant",
      "american",
      "restaurant",
      "american software",
      "american app",
      "american platform",
      "american system",
      "american management",
      "food-beverage american"
  ],

  synonyms: [
      "American Restaurant platform",
      "American Restaurant software",
      "American Restaurant system",
      "american solution",
      "american service"
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
      "Build a american restaurant platform",
      "Create a american restaurant app",
      "I need a american restaurant management system",
      "Build a american restaurant solution",
      "Create a american restaurant booking system"
  ],
};
