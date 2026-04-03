/**
 * Wholesale Bakery App Type Definition
 *
 * Complete definition for wholesale bakery applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WHOLESALE_BAKERY_APP_TYPE: AppTypeDefinition = {
  id: 'wholesale-bakery',
  name: 'Wholesale Bakery',
  category: 'hospitality',
  description: 'Wholesale Bakery platform with comprehensive management features',
  icon: 'bread',

  keywords: [
      "wholesale bakery",
      "wholesale",
      "bakery",
      "wholesale software",
      "wholesale app",
      "wholesale platform",
      "wholesale system",
      "wholesale management",
      "food-beverage wholesale"
  ],

  synonyms: [
      "Wholesale Bakery platform",
      "Wholesale Bakery software",
      "Wholesale Bakery system",
      "wholesale solution",
      "wholesale service"
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
      "Build a wholesale bakery platform",
      "Create a wholesale bakery app",
      "I need a wholesale bakery management system",
      "Build a wholesale bakery solution",
      "Create a wholesale bakery booking system"
  ],
};
