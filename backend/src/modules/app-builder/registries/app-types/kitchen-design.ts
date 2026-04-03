/**
 * Kitchen Design App Type Definition
 *
 * Complete definition for kitchen design applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const KITCHEN_DESIGN_APP_TYPE: AppTypeDefinition = {
  id: 'kitchen-design',
  name: 'Kitchen Design',
  category: 'hospitality',
  description: 'Kitchen Design platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "kitchen design",
      "kitchen",
      "design",
      "kitchen software",
      "kitchen app",
      "kitchen platform",
      "kitchen system",
      "kitchen management",
      "food-beverage kitchen"
  ],

  synonyms: [
      "Kitchen Design platform",
      "Kitchen Design software",
      "Kitchen Design system",
      "kitchen solution",
      "kitchen service"
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
      "Build a kitchen design platform",
      "Create a kitchen design app",
      "I need a kitchen design management system",
      "Build a kitchen design solution",
      "Create a kitchen design booking system"
  ],
};
