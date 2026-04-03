/**
 * Artisan Food App Type Definition
 *
 * Complete definition for artisan food applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ARTISAN_FOOD_APP_TYPE: AppTypeDefinition = {
  id: 'artisan-food',
  name: 'Artisan Food',
  category: 'hospitality',
  description: 'Artisan Food platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "artisan food",
      "artisan",
      "food",
      "artisan software",
      "artisan app",
      "artisan platform",
      "artisan system",
      "artisan management",
      "food-beverage artisan"
  ],

  synonyms: [
      "Artisan Food platform",
      "Artisan Food software",
      "Artisan Food system",
      "artisan solution",
      "artisan service"
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
      "Build a artisan food platform",
      "Create a artisan food app",
      "I need a artisan food management system",
      "Build a artisan food solution",
      "Create a artisan food booking system"
  ],
};
