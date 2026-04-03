/**
 * Internet Cafe App Type Definition
 *
 * Complete definition for internet cafe applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const INTERNET_CAFE_APP_TYPE: AppTypeDefinition = {
  id: 'internet-cafe',
  name: 'Internet Cafe',
  category: 'hospitality',
  description: 'Internet Cafe platform with comprehensive management features',
  icon: 'coffee',

  keywords: [
      "internet cafe",
      "internet",
      "cafe",
      "internet software",
      "internet app",
      "internet platform",
      "internet system",
      "internet management",
      "food-beverage internet"
  ],

  synonyms: [
      "Internet Cafe platform",
      "Internet Cafe software",
      "Internet Cafe system",
      "internet solution",
      "internet service"
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
      "Build a internet cafe platform",
      "Create a internet cafe app",
      "I need a internet cafe management system",
      "Build a internet cafe solution",
      "Create a internet cafe booking system"
  ],
};
