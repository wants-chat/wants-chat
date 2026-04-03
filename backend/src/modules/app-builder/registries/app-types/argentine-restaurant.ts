/**
 * Argentine Restaurant App Type Definition
 *
 * Complete definition for argentine restaurant applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ARGENTINE_RESTAURANT_APP_TYPE: AppTypeDefinition = {
  id: 'argentine-restaurant',
  name: 'Argentine Restaurant',
  category: 'hospitality',
  description: 'Argentine Restaurant platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "argentine restaurant",
      "argentine",
      "restaurant",
      "argentine software",
      "argentine app",
      "argentine platform",
      "argentine system",
      "argentine management",
      "food-beverage argentine"
  ],

  synonyms: [
      "Argentine Restaurant platform",
      "Argentine Restaurant software",
      "Argentine Restaurant system",
      "argentine solution",
      "argentine service"
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
      "Build a argentine restaurant platform",
      "Create a argentine restaurant app",
      "I need a argentine restaurant management system",
      "Build a argentine restaurant solution",
      "Create a argentine restaurant booking system"
  ],
};
