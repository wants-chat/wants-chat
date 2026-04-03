/**
 * Asian Restaurant App Type Definition
 *
 * Complete definition for asian restaurant applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ASIAN_RESTAURANT_APP_TYPE: AppTypeDefinition = {
  id: 'asian-restaurant',
  name: 'Asian Restaurant',
  category: 'hospitality',
  description: 'Asian Restaurant platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "asian restaurant",
      "asian",
      "restaurant",
      "asian software",
      "asian app",
      "asian platform",
      "asian system",
      "asian management",
      "food-beverage asian"
  ],

  synonyms: [
      "Asian Restaurant platform",
      "Asian Restaurant software",
      "Asian Restaurant system",
      "asian solution",
      "asian service"
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
      "Build a asian restaurant platform",
      "Create a asian restaurant app",
      "I need a asian restaurant management system",
      "Build a asian restaurant solution",
      "Create a asian restaurant booking system"
  ],
};
