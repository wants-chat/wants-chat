/**
 * Tequila Bar App Type Definition
 *
 * Complete definition for tequila bar applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TEQUILA_BAR_APP_TYPE: AppTypeDefinition = {
  id: 'tequila-bar',
  name: 'Tequila Bar',
  category: 'hospitality',
  description: 'Tequila Bar platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "tequila bar",
      "tequila",
      "bar",
      "tequila software",
      "tequila app",
      "tequila platform",
      "tequila system",
      "tequila management",
      "food-beverage tequila"
  ],

  synonyms: [
      "Tequila Bar platform",
      "Tequila Bar software",
      "Tequila Bar system",
      "tequila solution",
      "tequila service"
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
      "Build a tequila bar platform",
      "Create a tequila bar app",
      "I need a tequila bar management system",
      "Build a tequila bar solution",
      "Create a tequila bar booking system"
  ],
};
