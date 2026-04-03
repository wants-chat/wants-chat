/**
 * Snowboard Rental App Type Definition
 *
 * Complete definition for snowboard rental applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SNOWBOARD_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'snowboard-rental',
  name: 'Snowboard Rental',
  category: 'rental',
  description: 'Snowboard Rental platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "snowboard rental",
      "snowboard",
      "rental",
      "snowboard software",
      "snowboard app",
      "snowboard platform",
      "snowboard system",
      "snowboard management",
      "rental snowboard"
  ],

  synonyms: [
      "Snowboard Rental platform",
      "Snowboard Rental software",
      "Snowboard Rental system",
      "snowboard solution",
      "snowboard service"
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
          "name": "Administrator",
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
          "name": "User",
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
      "inventory",
      "reservations",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "invoicing",
      "check-in",
      "reviews",
      "discounts"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'rental',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a snowboard rental platform",
      "Create a snowboard rental app",
      "I need a snowboard rental management system",
      "Build a snowboard rental solution",
      "Create a snowboard rental booking system"
  ],
};
