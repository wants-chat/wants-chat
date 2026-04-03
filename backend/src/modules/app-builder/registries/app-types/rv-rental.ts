/**
 * Rv Rental App Type Definition
 *
 * Complete definition for rv rental applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RV_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'rv-rental',
  name: 'Rv Rental',
  category: 'rental',
  description: 'Rv Rental platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "rv rental",
      "rental",
      "rv software",
      "rv app",
      "rv platform",
      "rv system",
      "rv management",
      "rental rv"
  ],

  synonyms: [
      "Rv Rental platform",
      "Rv Rental software",
      "Rv Rental system",
      "rv solution",
      "rv service"
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
      "Build a rv rental platform",
      "Create a rv rental app",
      "I need a rv rental management system",
      "Build a rv rental solution",
      "Create a rv rental booking system"
  ],
};
