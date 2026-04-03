/**
 * Sushi Restaurant App Type Definition
 *
 * Complete definition for sushi restaurant applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SUSHI_RESTAURANT_APP_TYPE: AppTypeDefinition = {
  id: 'sushi-restaurant',
  name: 'Sushi Restaurant',
  category: 'hospitality',
  description: 'Sushi Restaurant platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "sushi restaurant",
      "sushi",
      "restaurant",
      "sushi software",
      "sushi app",
      "sushi platform",
      "sushi system",
      "sushi management",
      "food-beverage sushi"
  ],

  synonyms: [
      "Sushi Restaurant platform",
      "Sushi Restaurant software",
      "Sushi Restaurant system",
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
      "Build a sushi restaurant platform",
      "Create a sushi restaurant app",
      "I need a sushi restaurant management system",
      "Build a sushi restaurant solution",
      "Create a sushi restaurant booking system"
  ],
};
