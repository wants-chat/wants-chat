/**
 * Organic Restaurant App Type Definition
 *
 * Complete definition for organic restaurant applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ORGANIC_RESTAURANT_APP_TYPE: AppTypeDefinition = {
  id: 'organic-restaurant',
  name: 'Organic Restaurant',
  category: 'hospitality',
  description: 'Organic Restaurant platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "organic restaurant",
      "organic",
      "restaurant",
      "organic software",
      "organic app",
      "organic platform",
      "organic system",
      "organic management",
      "food-beverage organic"
  ],

  synonyms: [
      "Organic Restaurant platform",
      "Organic Restaurant software",
      "Organic Restaurant system",
      "organic solution",
      "organic service"
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
      "Build a organic restaurant platform",
      "Create a organic restaurant app",
      "I need a organic restaurant management system",
      "Build a organic restaurant solution",
      "Create a organic restaurant booking system"
  ],
};
