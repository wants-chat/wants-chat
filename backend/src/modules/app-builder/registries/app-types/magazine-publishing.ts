/**
 * Magazine Publishing App Type Definition
 *
 * Complete definition for magazine publishing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MAGAZINE_PUBLISHING_APP_TYPE: AppTypeDefinition = {
  id: 'magazine-publishing',
  name: 'Magazine Publishing',
  category: 'hospitality',
  description: 'Magazine Publishing platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "magazine publishing",
      "magazine",
      "publishing",
      "magazine software",
      "magazine app",
      "magazine platform",
      "magazine system",
      "magazine management",
      "food-beverage magazine"
  ],

  synonyms: [
      "Magazine Publishing platform",
      "Magazine Publishing software",
      "Magazine Publishing system",
      "magazine solution",
      "magazine service"
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
      "Build a magazine publishing platform",
      "Create a magazine publishing app",
      "I need a magazine publishing management system",
      "Build a magazine publishing solution",
      "Create a magazine publishing booking system"
  ],
};
