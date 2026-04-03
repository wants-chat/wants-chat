/**
 * Scooter Rental App Type Definition
 *
 * Complete definition for scooter rental applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SCOOTER_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'scooter-rental',
  name: 'Scooter Rental',
  category: 'rental',
  description: 'Scooter Rental platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "scooter rental",
      "scooter",
      "rental",
      "scooter software",
      "scooter app",
      "scooter platform",
      "scooter system",
      "scooter management",
      "rental scooter"
  ],

  synonyms: [
      "Scooter Rental platform",
      "Scooter Rental software",
      "Scooter Rental system",
      "scooter solution",
      "scooter service"
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
      "Build a scooter rental platform",
      "Create a scooter rental app",
      "I need a scooter rental management system",
      "Build a scooter rental solution",
      "Create a scooter rental booking system"
  ],
};
