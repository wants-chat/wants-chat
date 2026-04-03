/**
 * Houseboat Rental App Type Definition
 *
 * Complete definition for houseboat rental applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HOUSEBOAT_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'houseboat-rental',
  name: 'Houseboat Rental',
  category: 'rental',
  description: 'Houseboat Rental platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "houseboat rental",
      "houseboat",
      "rental",
      "houseboat software",
      "houseboat app",
      "houseboat platform",
      "houseboat system",
      "houseboat management",
      "rental houseboat"
  ],

  synonyms: [
      "Houseboat Rental platform",
      "Houseboat Rental software",
      "Houseboat Rental system",
      "houseboat solution",
      "houseboat service"
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
      "Build a houseboat rental platform",
      "Create a houseboat rental app",
      "I need a houseboat rental management system",
      "Build a houseboat rental solution",
      "Create a houseboat rental booking system"
  ],
};
