/**
 * Wagon Rental App Type Definition
 *
 * Complete definition for wagon rental applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WAGON_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'wagon-rental',
  name: 'Wagon Rental',
  category: 'rental',
  description: 'Wagon Rental platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "wagon rental",
      "wagon",
      "rental",
      "wagon software",
      "wagon app",
      "wagon platform",
      "wagon system",
      "wagon management",
      "rental wagon"
  ],

  synonyms: [
      "Wagon Rental platform",
      "Wagon Rental software",
      "Wagon Rental system",
      "wagon solution",
      "wagon service"
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
      "Build a wagon rental platform",
      "Create a wagon rental app",
      "I need a wagon rental management system",
      "Build a wagon rental solution",
      "Create a wagon rental booking system"
  ],
};
