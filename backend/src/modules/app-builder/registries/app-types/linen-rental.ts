/**
 * Linen Rental App Type Definition
 *
 * Complete definition for linen rental applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LINEN_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'linen-rental',
  name: 'Linen Rental',
  category: 'rental',
  description: 'Linen Rental platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "linen rental",
      "linen",
      "rental",
      "linen software",
      "linen app",
      "linen platform",
      "linen system",
      "linen management",
      "rental linen"
  ],

  synonyms: [
      "Linen Rental platform",
      "Linen Rental software",
      "Linen Rental system",
      "linen solution",
      "linen service"
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
      "Build a linen rental platform",
      "Create a linen rental app",
      "I need a linen rental management system",
      "Build a linen rental solution",
      "Create a linen rental booking system"
  ],
};
