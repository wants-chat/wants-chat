/**
 * Western Restaurant App Type Definition
 *
 * Complete definition for western restaurant applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WESTERN_RESTAURANT_APP_TYPE: AppTypeDefinition = {
  id: 'western-restaurant',
  name: 'Western Restaurant',
  category: 'hospitality',
  description: 'Western Restaurant platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "western restaurant",
      "western",
      "restaurant",
      "western software",
      "western app",
      "western platform",
      "western system",
      "western management",
      "food-beverage western"
  ],

  synonyms: [
      "Western Restaurant platform",
      "Western Restaurant software",
      "Western Restaurant system",
      "western solution",
      "western service"
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
      "Build a western restaurant platform",
      "Create a western restaurant app",
      "I need a western restaurant management system",
      "Build a western restaurant solution",
      "Create a western restaurant booking system"
  ],
};
