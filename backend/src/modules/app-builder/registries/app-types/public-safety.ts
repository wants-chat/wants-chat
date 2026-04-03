/**
 * Public Safety App Type Definition
 *
 * Complete definition for public safety applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PUBLIC_SAFETY_APP_TYPE: AppTypeDefinition = {
  id: 'public-safety',
  name: 'Public Safety',
  category: 'hospitality',
  description: 'Public Safety platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "public safety",
      "public",
      "safety",
      "public software",
      "public app",
      "public platform",
      "public system",
      "public management",
      "food-beverage public"
  ],

  synonyms: [
      "Public Safety platform",
      "Public Safety software",
      "Public Safety system",
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
      "Build a public safety platform",
      "Create a public safety app",
      "I need a public safety management system",
      "Build a public safety solution",
      "Create a public safety booking system"
  ],
};
