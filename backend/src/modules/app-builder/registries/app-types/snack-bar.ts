/**
 * Snack Bar App Type Definition
 *
 * Complete definition for snack bar applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SNACK_BAR_APP_TYPE: AppTypeDefinition = {
  id: 'snack-bar',
  name: 'Snack Bar',
  category: 'hospitality',
  description: 'Snack Bar platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "snack bar",
      "snack",
      "bar",
      "snack software",
      "snack app",
      "snack platform",
      "snack system",
      "snack management",
      "food-beverage snack"
  ],

  synonyms: [
      "Snack Bar platform",
      "Snack Bar software",
      "Snack Bar system",
      "snack solution",
      "snack service"
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
      "Build a snack bar platform",
      "Create a snack bar app",
      "I need a snack bar management system",
      "Build a snack bar solution",
      "Create a snack bar booking system"
  ],
};
