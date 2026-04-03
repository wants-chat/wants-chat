/**
 * Cafe App Type Definition
 *
 * Complete definition for cafe applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CAFE_APP_TYPE: AppTypeDefinition = {
  id: 'cafe',
  name: 'Cafe',
  category: 'hospitality',
  description: 'Cafe platform with comprehensive management features',
  icon: 'coffee',

  keywords: [
      "cafe",
      "cafe software",
      "cafe app",
      "cafe platform",
      "cafe system",
      "cafe management",
      "food-beverage cafe"
  ],

  synonyms: [
      "Cafe platform",
      "Cafe software",
      "Cafe system",
      "cafe solution",
      "cafe service"
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
      "Build a cafe platform",
      "Create a cafe app",
      "I need a cafe management system",
      "Build a cafe solution",
      "Create a cafe booking system"
  ],
};
