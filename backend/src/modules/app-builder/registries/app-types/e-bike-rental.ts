/**
 * E Bike Rental App Type Definition
 *
 * Complete definition for e bike rental applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const E_BIKE_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'e-bike-rental',
  name: 'E Bike Rental',
  category: 'rental',
  description: 'E Bike Rental platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "e bike rental",
      "bike",
      "rental",
      "e software",
      "e app",
      "e platform",
      "e system",
      "e management",
      "rental e"
  ],

  synonyms: [
      "E Bike Rental platform",
      "E Bike Rental software",
      "E Bike Rental system",
      "e solution",
      "e service"
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
      "Build a e bike rental platform",
      "Create a e bike rental app",
      "I need a e bike rental management system",
      "Build a e bike rental solution",
      "Create a e bike rental booking system"
  ],
};
