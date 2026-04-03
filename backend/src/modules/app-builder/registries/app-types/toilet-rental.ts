/**
 * Toilet Rental App Type Definition
 *
 * Complete definition for toilet rental applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TOILET_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'toilet-rental',
  name: 'Toilet Rental',
  category: 'rental',
  description: 'Toilet Rental platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "toilet rental",
      "toilet",
      "rental",
      "toilet software",
      "toilet app",
      "toilet platform",
      "toilet system",
      "toilet management",
      "rental toilet"
  ],

  synonyms: [
      "Toilet Rental platform",
      "Toilet Rental software",
      "Toilet Rental system",
      "toilet solution",
      "toilet service"
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
      "Build a toilet rental platform",
      "Create a toilet rental app",
      "I need a toilet rental management system",
      "Build a toilet rental solution",
      "Create a toilet rental booking system"
  ],
};
