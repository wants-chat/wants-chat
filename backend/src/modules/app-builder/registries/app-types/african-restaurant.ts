/**
 * African Restaurant App Type Definition
 *
 * Complete definition for african restaurant applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AFRICAN_RESTAURANT_APP_TYPE: AppTypeDefinition = {
  id: 'african-restaurant',
  name: 'African Restaurant',
  category: 'hospitality',
  description: 'African Restaurant platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "african restaurant",
      "african",
      "restaurant",
      "african software",
      "african app",
      "african platform",
      "african system",
      "african management",
      "food-beverage african"
  ],

  synonyms: [
      "African Restaurant platform",
      "African Restaurant software",
      "African Restaurant system",
      "african solution",
      "african service"
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
      "Build a african restaurant platform",
      "Create a african restaurant app",
      "I need a african restaurant management system",
      "Build a african restaurant solution",
      "Create a african restaurant booking system"
  ],
};
