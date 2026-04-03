/**
 * Swiss Restaurant App Type Definition
 *
 * Complete definition for swiss restaurant applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SWISS_RESTAURANT_APP_TYPE: AppTypeDefinition = {
  id: 'swiss-restaurant',
  name: 'Swiss Restaurant',
  category: 'hospitality',
  description: 'Swiss Restaurant platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "swiss restaurant",
      "swiss",
      "restaurant",
      "swiss software",
      "swiss app",
      "swiss platform",
      "swiss system",
      "swiss management",
      "food-beverage swiss"
  ],

  synonyms: [
      "Swiss Restaurant platform",
      "Swiss Restaurant software",
      "Swiss Restaurant system",
      "swiss solution",
      "swiss service"
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
      "Build a swiss restaurant platform",
      "Create a swiss restaurant app",
      "I need a swiss restaurant management system",
      "Build a swiss restaurant solution",
      "Create a swiss restaurant booking system"
  ],
};
