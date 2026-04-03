/**
 * Public Speaking App Type Definition
 *
 * Complete definition for public speaking applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PUBLIC_SPEAKING_APP_TYPE: AppTypeDefinition = {
  id: 'public-speaking',
  name: 'Public Speaking',
  category: 'hospitality',
  description: 'Public Speaking platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "public speaking",
      "public",
      "speaking",
      "public software",
      "public app",
      "public platform",
      "public system",
      "public management",
      "food-beverage public"
  ],

  synonyms: [
      "Public Speaking platform",
      "Public Speaking software",
      "Public Speaking system",
      "public solution",
      "public service"
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
      "Build a public speaking platform",
      "Create a public speaking app",
      "I need a public speaking management system",
      "Build a public speaking solution",
      "Create a public speaking booking system"
  ],
};
