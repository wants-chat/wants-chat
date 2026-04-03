/**
 * Indian Restaurant App Type Definition
 *
 * Complete definition for indian restaurant applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const INDIAN_RESTAURANT_APP_TYPE: AppTypeDefinition = {
  id: 'indian-restaurant',
  name: 'Indian Restaurant',
  category: 'hospitality',
  description: 'Indian Restaurant platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "indian restaurant",
      "indian",
      "restaurant",
      "indian software",
      "indian app",
      "indian platform",
      "indian system",
      "indian management",
      "food-beverage indian"
  ],

  synonyms: [
      "Indian Restaurant platform",
      "Indian Restaurant software",
      "Indian Restaurant system",
      "indian solution",
      "indian service"
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
      "Build a indian restaurant platform",
      "Create a indian restaurant app",
      "I need a indian restaurant management system",
      "Build a indian restaurant solution",
      "Create a indian restaurant booking system"
  ],
};
