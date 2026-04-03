/**
 * Tuxedo Rental App Type Definition
 *
 * Complete definition for tuxedo rental applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TUXEDO_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'tuxedo-rental',
  name: 'Tuxedo Rental',
  category: 'rental',
  description: 'Tuxedo Rental platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "tuxedo rental",
      "tuxedo",
      "rental",
      "tuxedo software",
      "tuxedo app",
      "tuxedo platform",
      "tuxedo system",
      "tuxedo management",
      "rental tuxedo"
  ],

  synonyms: [
      "Tuxedo Rental platform",
      "Tuxedo Rental software",
      "Tuxedo Rental system",
      "tuxedo solution",
      "tuxedo service"
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
      "Build a tuxedo rental platform",
      "Create a tuxedo rental app",
      "I need a tuxedo rental management system",
      "Build a tuxedo rental solution",
      "Create a tuxedo rental booking system"
  ],
};
