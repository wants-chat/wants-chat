/**
 * Tow Bar App Type Definition
 *
 * Complete definition for tow bar applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TOW_BAR_APP_TYPE: AppTypeDefinition = {
  id: 'tow-bar',
  name: 'Tow Bar',
  category: 'hospitality',
  description: 'Tow Bar platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "tow bar",
      "tow",
      "bar",
      "tow software",
      "tow app",
      "tow platform",
      "tow system",
      "tow management",
      "food-beverage tow"
  ],

  synonyms: [
      "Tow Bar platform",
      "Tow Bar software",
      "Tow Bar system",
      "tow solution",
      "tow service"
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
      "Build a tow bar platform",
      "Create a tow bar app",
      "I need a tow bar management system",
      "Build a tow bar solution",
      "Create a tow bar booking system"
  ],
};
