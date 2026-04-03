/**
 * Italian Restaurant App Type Definition
 *
 * Complete definition for italian restaurant applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ITALIAN_RESTAURANT_APP_TYPE: AppTypeDefinition = {
  id: 'italian-restaurant',
  name: 'Italian Restaurant',
  category: 'hospitality',
  description: 'Italian Restaurant platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "italian restaurant",
      "italian",
      "restaurant",
      "italian software",
      "italian app",
      "italian platform",
      "italian system",
      "italian management",
      "food-beverage italian"
  ],

  synonyms: [
      "Italian Restaurant platform",
      "Italian Restaurant software",
      "Italian Restaurant system",
      "italian solution",
      "italian service"
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
      "Build a italian restaurant platform",
      "Create a italian restaurant app",
      "I need a italian restaurant management system",
      "Build a italian restaurant solution",
      "Create a italian restaurant booking system"
  ],
};
