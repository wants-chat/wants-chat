/**
 * Pet Bakery App Type Definition
 *
 * Complete definition for pet bakery applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PET_BAKERY_APP_TYPE: AppTypeDefinition = {
  id: 'pet-bakery',
  name: 'Pet Bakery',
  category: 'hospitality',
  description: 'Pet Bakery platform with comprehensive management features',
  icon: 'bread',

  keywords: [
      "pet bakery",
      "pet",
      "bakery",
      "pet software",
      "pet app",
      "pet platform",
      "pet system",
      "pet management",
      "food-beverage pet"
  ],

  synonyms: [
      "Pet Bakery platform",
      "Pet Bakery software",
      "Pet Bakery system",
      "pet solution",
      "pet service"
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
      "Build a pet bakery platform",
      "Create a pet bakery app",
      "I need a pet bakery management system",
      "Build a pet bakery solution",
      "Create a pet bakery booking system"
  ],
};
