/**
 * Public Notary App Type Definition
 *
 * Complete definition for public notary applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PUBLIC_NOTARY_APP_TYPE: AppTypeDefinition = {
  id: 'public-notary',
  name: 'Public Notary',
  category: 'hospitality',
  description: 'Public Notary platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "public notary",
      "public",
      "notary",
      "public software",
      "public app",
      "public platform",
      "public system",
      "public management",
      "food-beverage public"
  ],

  synonyms: [
      "Public Notary platform",
      "Public Notary software",
      "Public Notary system",
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
      "Build a public notary platform",
      "Create a public notary app",
      "I need a public notary management system",
      "Build a public notary solution",
      "Create a public notary booking system"
  ],
};
