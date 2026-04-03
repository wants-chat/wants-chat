/**
 * Kitchen Supplies App Type Definition
 *
 * Complete definition for kitchen supplies applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const KITCHEN_SUPPLIES_APP_TYPE: AppTypeDefinition = {
  id: 'kitchen-supplies',
  name: 'Kitchen Supplies',
  category: 'hospitality',
  description: 'Kitchen Supplies platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "kitchen supplies",
      "kitchen",
      "supplies",
      "kitchen software",
      "kitchen app",
      "kitchen platform",
      "kitchen system",
      "kitchen management",
      "food-beverage kitchen"
  ],

  synonyms: [
      "Kitchen Supplies platform",
      "Kitchen Supplies software",
      "Kitchen Supplies system",
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
      "Build a kitchen supplies platform",
      "Create a kitchen supplies app",
      "I need a kitchen supplies management system",
      "Build a kitchen supplies solution",
      "Create a kitchen supplies booking system"
  ],
};
