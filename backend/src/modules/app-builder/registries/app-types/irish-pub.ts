/**
 * Irish Pub App Type Definition
 *
 * Complete definition for irish pub applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const IRISH_PUB_APP_TYPE: AppTypeDefinition = {
  id: 'irish-pub',
  name: 'Irish Pub',
  category: 'hospitality',
  description: 'Irish Pub platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "irish pub",
      "irish",
      "pub",
      "irish software",
      "irish app",
      "irish platform",
      "irish system",
      "irish management",
      "food-beverage irish"
  ],

  synonyms: [
      "Irish Pub platform",
      "Irish Pub software",
      "Irish Pub system",
      "irish solution",
      "irish service"
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
      "Build a irish pub platform",
      "Create a irish pub app",
      "I need a irish pub management system",
      "Build a irish pub solution",
      "Create a irish pub booking system"
  ],
};
