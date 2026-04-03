/**
 * Aperitif Bar App Type Definition
 *
 * Complete definition for aperitif bar applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const APERITIF_BAR_APP_TYPE: AppTypeDefinition = {
  id: 'aperitif-bar',
  name: 'Aperitif Bar',
  category: 'hospitality',
  description: 'Aperitif Bar platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "aperitif bar",
      "aperitif",
      "bar",
      "aperitif software",
      "aperitif app",
      "aperitif platform",
      "aperitif system",
      "aperitif management",
      "food-beverage aperitif"
  ],

  synonyms: [
      "Aperitif Bar platform",
      "Aperitif Bar software",
      "Aperitif Bar system",
      "aperitif solution",
      "aperitif service"
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
      "Build a aperitif bar platform",
      "Create a aperitif bar app",
      "I need a aperitif bar management system",
      "Build a aperitif bar solution",
      "Create a aperitif bar booking system"
  ],
};
