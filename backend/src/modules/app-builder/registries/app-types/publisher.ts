/**
 * Publisher App Type Definition
 *
 * Complete definition for publisher applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PUBLISHER_APP_TYPE: AppTypeDefinition = {
  id: 'publisher',
  name: 'Publisher',
  category: 'hospitality',
  description: 'Publisher platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "publisher",
      "publisher software",
      "publisher app",
      "publisher platform",
      "publisher system",
      "publisher management",
      "food-beverage publisher"
  ],

  synonyms: [
      "Publisher platform",
      "Publisher software",
      "Publisher system",
      "publisher solution",
      "publisher service"
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
      "Build a publisher platform",
      "Create a publisher app",
      "I need a publisher management system",
      "Build a publisher solution",
      "Create a publisher booking system"
  ],
};
