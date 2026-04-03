/**
 * Exotic Car Rental App Type Definition
 *
 * Complete definition for exotic car rental applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const EXOTIC_CAR_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'exotic-car-rental',
  name: 'Exotic Car Rental',
  category: 'rental',
  description: 'Exotic Car Rental platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "exotic car rental",
      "exotic",
      "car",
      "rental",
      "exotic software",
      "exotic app",
      "exotic platform",
      "exotic system",
      "exotic management",
      "rental exotic"
  ],

  synonyms: [
      "Exotic Car Rental platform",
      "Exotic Car Rental software",
      "Exotic Car Rental system",
      "exotic solution",
      "exotic service"
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
      "Build a exotic car rental platform",
      "Create a exotic car rental app",
      "I need a exotic car rental management system",
      "Build a exotic car rental solution",
      "Create a exotic car rental booking system"
  ],
};
