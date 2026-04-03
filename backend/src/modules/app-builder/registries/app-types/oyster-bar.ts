/**
 * Oyster Bar App Type Definition
 *
 * Complete definition for oyster bar applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const OYSTER_BAR_APP_TYPE: AppTypeDefinition = {
  id: 'oyster-bar',
  name: 'Oyster Bar',
  category: 'hospitality',
  description: 'Oyster Bar platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "oyster bar",
      "oyster",
      "bar",
      "oyster software",
      "oyster app",
      "oyster platform",
      "oyster system",
      "oyster management",
      "food-beverage oyster"
  ],

  synonyms: [
      "Oyster Bar platform",
      "Oyster Bar software",
      "Oyster Bar system",
      "oyster solution",
      "oyster service"
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
      "Build a oyster bar platform",
      "Create a oyster bar app",
      "I need a oyster bar management system",
      "Build a oyster bar solution",
      "Create a oyster bar booking system"
  ],
};
