/**
 * Watersports Rental App Type Definition
 *
 * Complete definition for watersports rental applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WATERSPORTS_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'watersports-rental',
  name: 'Watersports Rental',
  category: 'rental',
  description: 'Watersports Rental platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "watersports rental",
      "watersports",
      "rental",
      "watersports software",
      "watersports app",
      "watersports platform",
      "watersports system",
      "watersports management",
      "rental watersports"
  ],

  synonyms: [
      "Watersports Rental platform",
      "Watersports Rental software",
      "Watersports Rental system",
      "watersports solution",
      "watersports service"
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
      "Build a watersports rental platform",
      "Create a watersports rental app",
      "I need a watersports rental management system",
      "Build a watersports rental solution",
      "Create a watersports rental booking system"
  ],
};
