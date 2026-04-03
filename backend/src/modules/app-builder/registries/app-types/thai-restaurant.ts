/**
 * Thai Restaurant App Type Definition
 *
 * Complete definition for thai restaurant applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const THAI_RESTAURANT_APP_TYPE: AppTypeDefinition = {
  id: 'thai-restaurant',
  name: 'Thai Restaurant',
  category: 'hospitality',
  description: 'Thai Restaurant platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "thai restaurant",
      "thai",
      "restaurant",
      "thai software",
      "thai app",
      "thai platform",
      "thai system",
      "thai management",
      "food-beverage thai"
  ],

  synonyms: [
      "Thai Restaurant platform",
      "Thai Restaurant software",
      "Thai Restaurant system",
      "thai solution",
      "thai service"
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
      "Build a thai restaurant platform",
      "Create a thai restaurant app",
      "I need a thai restaurant management system",
      "Build a thai restaurant solution",
      "Create a thai restaurant booking system"
  ],
};
