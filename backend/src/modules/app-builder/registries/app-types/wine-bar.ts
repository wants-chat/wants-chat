/**
 * Wine Bar App Type Definition
 *
 * Complete definition for wine bar applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WINE_BAR_APP_TYPE: AppTypeDefinition = {
  id: 'wine-bar',
  name: 'Wine Bar',
  category: 'hospitality',
  description: 'Wine Bar platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "wine bar",
      "wine",
      "bar",
      "wine software",
      "wine app",
      "wine platform",
      "wine system",
      "wine management",
      "food-beverage wine"
  ],

  synonyms: [
      "Wine Bar platform",
      "Wine Bar software",
      "Wine Bar system",
      "wine solution",
      "wine service"
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
      "Build a wine bar platform",
      "Create a wine bar app",
      "I need a wine bar management system",
      "Build a wine bar solution",
      "Create a wine bar booking system"
  ],
};
