/**
 * Raw Food App Type Definition
 *
 * Complete definition for raw food applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RAW_FOOD_APP_TYPE: AppTypeDefinition = {
  id: 'raw-food',
  name: 'Raw Food',
  category: 'hospitality',
  description: 'Raw Food platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "raw food",
      "raw",
      "food",
      "raw software",
      "raw app",
      "raw platform",
      "raw system",
      "raw management",
      "food-beverage raw"
  ],

  synonyms: [
      "Raw Food platform",
      "Raw Food software",
      "Raw Food system",
      "raw solution",
      "raw service"
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
      "Build a raw food platform",
      "Create a raw food app",
      "I need a raw food management system",
      "Build a raw food solution",
      "Create a raw food booking system"
  ],
};
