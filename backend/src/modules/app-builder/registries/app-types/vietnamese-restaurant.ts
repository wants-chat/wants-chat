/**
 * Vietnamese Restaurant App Type Definition
 *
 * Complete definition for vietnamese restaurant applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VIETNAMESE_RESTAURANT_APP_TYPE: AppTypeDefinition = {
  id: 'vietnamese-restaurant',
  name: 'Vietnamese Restaurant',
  category: 'hospitality',
  description: 'Vietnamese Restaurant platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "vietnamese restaurant",
      "vietnamese",
      "restaurant",
      "vietnamese software",
      "vietnamese app",
      "vietnamese platform",
      "vietnamese system",
      "vietnamese management",
      "food-beverage vietnamese"
  ],

  synonyms: [
      "Vietnamese Restaurant platform",
      "Vietnamese Restaurant software",
      "Vietnamese Restaurant system",
      "vietnamese solution",
      "vietnamese service"
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
      "Build a vietnamese restaurant platform",
      "Create a vietnamese restaurant app",
      "I need a vietnamese restaurant management system",
      "Build a vietnamese restaurant solution",
      "Create a vietnamese restaurant booking system"
  ],
};
