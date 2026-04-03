/**
 * Sushi Bar App Type Definition
 *
 * Complete definition for sushi bar applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SUSHI_BAR_APP_TYPE: AppTypeDefinition = {
  id: 'sushi-bar',
  name: 'Sushi Bar',
  category: 'hospitality',
  description: 'Sushi Bar platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "sushi bar",
      "sushi",
      "bar",
      "sushi software",
      "sushi app",
      "sushi platform",
      "sushi system",
      "sushi management",
      "food-beverage sushi"
  ],

  synonyms: [
      "Sushi Bar platform",
      "Sushi Bar software",
      "Sushi Bar system",
      "sushi solution",
      "sushi service"
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
      "Build a sushi bar platform",
      "Create a sushi bar app",
      "I need a sushi bar management system",
      "Build a sushi bar solution",
      "Create a sushi bar booking system"
  ],
};
