/**
 * Tube Rental App Type Definition
 *
 * Complete definition for tube rental applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TUBE_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'tube-rental',
  name: 'Tube Rental',
  category: 'rental',
  description: 'Tube Rental platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "tube rental",
      "tube",
      "rental",
      "tube software",
      "tube app",
      "tube platform",
      "tube system",
      "tube management",
      "rental tube"
  ],

  synonyms: [
      "Tube Rental platform",
      "Tube Rental software",
      "Tube Rental system",
      "tube solution",
      "tube service"
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
      "Build a tube rental platform",
      "Create a tube rental app",
      "I need a tube rental management system",
      "Build a tube rental solution",
      "Create a tube rental booking system"
  ],
};
