/**
 * Vegan Restaurant App Type Definition
 *
 * Complete definition for vegan restaurant applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VEGAN_RESTAURANT_APP_TYPE: AppTypeDefinition = {
  id: 'vegan-restaurant',
  name: 'Vegan Restaurant',
  category: 'hospitality',
  description: 'Vegan Restaurant platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "vegan restaurant",
      "vegan",
      "restaurant",
      "vegan software",
      "vegan app",
      "vegan platform",
      "vegan system",
      "vegan management",
      "food-beverage vegan"
  ],

  synonyms: [
      "Vegan Restaurant platform",
      "Vegan Restaurant software",
      "Vegan Restaurant system",
      "vegan solution",
      "vegan service"
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
      "Build a vegan restaurant platform",
      "Create a vegan restaurant app",
      "I need a vegan restaurant management system",
      "Build a vegan restaurant solution",
      "Create a vegan restaurant booking system"
  ],
};
