/**
 * Tapas Bar App Type Definition
 *
 * Complete definition for tapas bar applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TAPAS_BAR_APP_TYPE: AppTypeDefinition = {
  id: 'tapas-bar',
  name: 'Tapas Bar',
  category: 'hospitality',
  description: 'Tapas Bar platform with comprehensive management features',
  icon: 'utensils',

  keywords: [
      "tapas bar",
      "tapas",
      "bar",
      "tapas software",
      "tapas app",
      "tapas platform",
      "tapas system",
      "tapas management",
      "food-beverage tapas"
  ],

  synonyms: [
      "Tapas Bar platform",
      "Tapas Bar software",
      "Tapas Bar system",
      "tapas solution",
      "tapas service"
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
      "Build a tapas bar platform",
      "Create a tapas bar app",
      "I need a tapas bar management system",
      "Build a tapas bar solution",
      "Create a tapas bar booking system"
  ],
};
