/**
 * Suit Rental App Type Definition
 *
 * Complete definition for suit rental applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SUIT_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'suit-rental',
  name: 'Suit Rental',
  category: 'rental',
  description: 'Suit Rental platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "suit rental",
      "suit",
      "rental",
      "suit software",
      "suit app",
      "suit platform",
      "suit system",
      "suit management",
      "rental suit"
  ],

  synonyms: [
      "Suit Rental platform",
      "Suit Rental software",
      "Suit Rental system",
      "suit solution",
      "suit service"
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
      "Build a suit rental platform",
      "Create a suit rental app",
      "I need a suit rental management system",
      "Build a suit rental solution",
      "Create a suit rental booking system"
  ],
};
