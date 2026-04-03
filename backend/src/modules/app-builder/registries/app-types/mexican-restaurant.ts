/**
 * Mexican Restaurant App Type Definition
 *
 * Complete definition for mexican restaurant applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MEXICAN_RESTAURANT_APP_TYPE: AppTypeDefinition = {
  id: 'mexican-restaurant',
  name: 'Mexican Restaurant',
  category: 'hospitality',
  description: 'Mexican Restaurant platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "mexican restaurant",
      "mexican",
      "restaurant",
      "mexican software",
      "mexican app",
      "mexican platform",
      "mexican system",
      "mexican management",
      "food-beverage mexican"
  ],

  synonyms: [
      "Mexican Restaurant platform",
      "Mexican Restaurant software",
      "Mexican Restaurant system",
      "mexican solution",
      "mexican service"
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
      "Build a mexican restaurant platform",
      "Create a mexican restaurant app",
      "I need a mexican restaurant management system",
      "Build a mexican restaurant solution",
      "Create a mexican restaurant booking system"
  ],
};
