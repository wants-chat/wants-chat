/**
 * Soup Kitchen App Type Definition
 *
 * Complete definition for soup kitchen applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SOUP_KITCHEN_APP_TYPE: AppTypeDefinition = {
  id: 'soup-kitchen',
  name: 'Soup Kitchen',
  category: 'hospitality',
  description: 'Soup Kitchen platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "soup kitchen",
      "soup",
      "kitchen",
      "soup software",
      "soup app",
      "soup platform",
      "soup system",
      "soup management",
      "food-beverage soup"
  ],

  synonyms: [
      "Soup Kitchen platform",
      "Soup Kitchen software",
      "Soup Kitchen system",
      "soup solution",
      "soup service"
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
      "Build a soup kitchen platform",
      "Create a soup kitchen app",
      "I need a soup kitchen management system",
      "Build a soup kitchen solution",
      "Create a soup kitchen booking system"
  ],
};
