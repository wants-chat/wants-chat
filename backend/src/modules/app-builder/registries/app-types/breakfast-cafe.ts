/**
 * Breakfast Cafe App Type Definition
 *
 * Complete definition for breakfast cafe applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BREAKFAST_CAFE_APP_TYPE: AppTypeDefinition = {
  id: 'breakfast-cafe',
  name: 'Breakfast Cafe',
  category: 'hospitality',
  description: 'Breakfast Cafe platform with comprehensive management features',
  icon: 'coffee',

  keywords: [
      "breakfast cafe",
      "breakfast",
      "cafe",
      "breakfast software",
      "breakfast app",
      "breakfast platform",
      "breakfast system",
      "breakfast management",
      "food-beverage breakfast"
  ],

  synonyms: [
      "Breakfast Cafe platform",
      "Breakfast Cafe software",
      "Breakfast Cafe system",
      "breakfast solution",
      "breakfast service"
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
      "menu-management",
      "food-ordering",
      "pos-system",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "subscriptions",
      "discounts"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'food-beverage',

  defaultColorScheme: 'brown',
  defaultDesignVariant: 'cozy',

  examplePrompts: [
      "Build a breakfast cafe platform",
      "Create a breakfast cafe app",
      "I need a breakfast cafe management system",
      "Build a breakfast cafe solution",
      "Create a breakfast cafe booking system"
  ],
};
