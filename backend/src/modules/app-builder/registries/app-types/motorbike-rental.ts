/**
 * Motorbike Rental App Type Definition
 *
 * Complete definition for motorbike rental applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MOTORBIKE_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'motorbike-rental',
  name: 'Motorbike Rental',
  category: 'rental',
  description: 'Motorbike Rental platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "motorbike rental",
      "motorbike",
      "rental",
      "motorbike software",
      "motorbike app",
      "motorbike platform",
      "motorbike system",
      "motorbike management",
      "rental motorbike"
  ],

  synonyms: [
      "Motorbike Rental platform",
      "Motorbike Rental software",
      "Motorbike Rental system",
      "motorbike solution",
      "motorbike service"
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
      "Build a motorbike rental platform",
      "Create a motorbike rental app",
      "I need a motorbike rental management system",
      "Build a motorbike rental solution",
      "Create a motorbike rental booking system"
  ],
};
