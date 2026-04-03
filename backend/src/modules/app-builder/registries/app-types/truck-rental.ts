/**
 * Truck Rental App Type Definition
 *
 * Complete definition for truck rental applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRUCK_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'truck-rental',
  name: 'Truck Rental',
  category: 'rental',
  description: 'Truck Rental platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "truck rental",
      "truck",
      "rental",
      "truck software",
      "truck app",
      "truck platform",
      "truck system",
      "truck management",
      "rental truck"
  ],

  synonyms: [
      "Truck Rental platform",
      "Truck Rental software",
      "Truck Rental system",
      "truck solution",
      "truck service"
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
      "Build a truck rental platform",
      "Create a truck rental app",
      "I need a truck rental management system",
      "Build a truck rental solution",
      "Create a truck rental booking system"
  ],
};
