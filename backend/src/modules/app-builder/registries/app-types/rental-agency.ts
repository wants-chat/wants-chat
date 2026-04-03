/**
 * Rental Agency App Type Definition
 *
 * Complete definition for rental agency applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RENTAL_AGENCY_APP_TYPE: AppTypeDefinition = {
  id: 'rental-agency',
  name: 'Rental Agency',
  category: 'rental',
  description: 'Rental Agency platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "rental agency",
      "rental",
      "agency",
      "rental software",
      "rental app",
      "rental platform",
      "rental system",
      "rental management",
      "rental rental"
  ],

  synonyms: [
      "Rental Agency platform",
      "Rental Agency software",
      "Rental Agency system",
      "rental solution",
      "rental service"
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
      "Build a rental agency platform",
      "Create a rental agency app",
      "I need a rental agency management system",
      "Build a rental agency solution",
      "Create a rental agency booking system"
  ],
};
