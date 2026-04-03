/**
 * Wing Restaurant App Type Definition
 *
 * Complete definition for wing restaurant applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WING_RESTAURANT_APP_TYPE: AppTypeDefinition = {
  id: 'wing-restaurant',
  name: 'Wing Restaurant',
  category: 'hospitality',
  description: 'Wing Restaurant platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "wing restaurant",
      "wing",
      "restaurant",
      "wing software",
      "wing app",
      "wing platform",
      "wing system",
      "wing management",
      "food-beverage wing"
  ],

  synonyms: [
      "Wing Restaurant platform",
      "Wing Restaurant software",
      "Wing Restaurant system",
      "wing solution",
      "wing service"
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
      "Build a wing restaurant platform",
      "Create a wing restaurant app",
      "I need a wing restaurant management system",
      "Build a wing restaurant solution",
      "Create a wing restaurant booking system"
  ],
};
