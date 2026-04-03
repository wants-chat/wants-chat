/**
 * French Restaurant App Type Definition
 *
 * Complete definition for french restaurant applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FRENCH_RESTAURANT_APP_TYPE: AppTypeDefinition = {
  id: 'french-restaurant',
  name: 'French Restaurant',
  category: 'hospitality',
  description: 'French Restaurant platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "french restaurant",
      "french",
      "restaurant",
      "french software",
      "french app",
      "french platform",
      "french system",
      "french management",
      "food-beverage french"
  ],

  synonyms: [
      "French Restaurant platform",
      "French Restaurant software",
      "French Restaurant system",
      "french solution",
      "french service"
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
      "Build a french restaurant platform",
      "Create a french restaurant app",
      "I need a french restaurant management system",
      "Build a french restaurant solution",
      "Create a french restaurant booking system"
  ],
};
