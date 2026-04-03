/**
 * Vegan Bakery App Type Definition
 *
 * Complete definition for vegan bakery applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VEGAN_BAKERY_APP_TYPE: AppTypeDefinition = {
  id: 'vegan-bakery',
  name: 'Vegan Bakery',
  category: 'hospitality',
  description: 'Vegan Bakery platform with comprehensive management features',
  icon: 'bread',

  keywords: [
      "vegan bakery",
      "vegan",
      "bakery",
      "vegan software",
      "vegan app",
      "vegan platform",
      "vegan system",
      "vegan management",
      "food-beverage vegan"
  ],

  synonyms: [
      "Vegan Bakery platform",
      "Vegan Bakery software",
      "Vegan Bakery system",
      "vegan solution",
      "vegan service"
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
      "product-catalog",
      "orders",
      "pos-system",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "gallery",
      "subscriptions",
      "shipping"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'food-beverage',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'warm',

  examplePrompts: [
      "Build a vegan bakery platform",
      "Create a vegan bakery app",
      "I need a vegan bakery management system",
      "Build a vegan bakery solution",
      "Create a vegan bakery booking system"
  ],
};
