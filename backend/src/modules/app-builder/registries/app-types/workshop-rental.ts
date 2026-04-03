/**
 * Workshop Rental App Type Definition
 *
 * Complete definition for workshop rental applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WORKSHOP_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'workshop-rental',
  name: 'Workshop Rental',
  category: 'rental',
  description: 'Workshop Rental platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "workshop rental",
      "workshop",
      "rental",
      "workshop software",
      "workshop app",
      "workshop platform",
      "workshop system",
      "workshop management",
      "rental workshop"
  ],

  synonyms: [
      "Workshop Rental platform",
      "Workshop Rental software",
      "Workshop Rental system",
      "workshop solution",
      "workshop service"
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
      "Build a workshop rental platform",
      "Create a workshop rental app",
      "I need a workshop rental management system",
      "Build a workshop rental solution",
      "Create a workshop rental booking system"
  ],
};
