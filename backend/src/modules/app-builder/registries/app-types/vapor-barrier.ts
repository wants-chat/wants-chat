/**
 * Vapor Barrier App Type Definition
 *
 * Complete definition for vapor barrier applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VAPOR_BARRIER_APP_TYPE: AppTypeDefinition = {
  id: 'vapor-barrier',
  name: 'Vapor Barrier',
  category: 'hospitality',
  description: 'Vapor Barrier platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "vapor barrier",
      "vapor",
      "barrier",
      "vapor software",
      "vapor app",
      "vapor platform",
      "vapor system",
      "vapor management",
      "food-beverage vapor"
  ],

  synonyms: [
      "Vapor Barrier platform",
      "Vapor Barrier software",
      "Vapor Barrier system",
      "vapor solution",
      "vapor service"
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
      "Build a vapor barrier platform",
      "Create a vapor barrier app",
      "I need a vapor barrier management system",
      "Build a vapor barrier solution",
      "Create a vapor barrier booking system"
  ],
};
