/**
 * Whole Foods App Type Definition
 *
 * Complete definition for whole foods applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WHOLE_FOODS_APP_TYPE: AppTypeDefinition = {
  id: 'whole-foods',
  name: 'Whole Foods',
  category: 'hospitality',
  description: 'Whole Foods platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "whole foods",
      "whole",
      "foods",
      "whole software",
      "whole app",
      "whole platform",
      "whole system",
      "whole management",
      "food-beverage whole"
  ],

  synonyms: [
      "Whole Foods platform",
      "Whole Foods software",
      "Whole Foods system",
      "whole solution",
      "whole service"
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
      "Build a whole foods platform",
      "Create a whole foods app",
      "I need a whole foods management system",
      "Build a whole foods solution",
      "Create a whole foods booking system"
  ],
};
