/**
 * Trailer Rental App Type Definition
 *
 * Complete definition for trailer rental applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRAILER_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'trailer-rental',
  name: 'Trailer Rental',
  category: 'rental',
  description: 'Trailer Rental platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "trailer rental",
      "trailer",
      "rental",
      "trailer software",
      "trailer app",
      "trailer platform",
      "trailer system",
      "trailer management",
      "rental trailer"
  ],

  synonyms: [
      "Trailer Rental platform",
      "Trailer Rental software",
      "Trailer Rental system",
      "trailer solution",
      "trailer service"
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
      "Build a trailer rental platform",
      "Create a trailer rental app",
      "I need a trailer rental management system",
      "Build a trailer rental solution",
      "Create a trailer rental booking system"
  ],
};
