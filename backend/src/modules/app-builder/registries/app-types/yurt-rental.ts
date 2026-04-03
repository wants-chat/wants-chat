/**
 * Yurt Rental App Type Definition
 *
 * Complete definition for yurt rental applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YURT_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'yurt-rental',
  name: 'Yurt Rental',
  category: 'rental',
  description: 'Yurt Rental platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "yurt rental",
      "yurt",
      "rental",
      "yurt software",
      "yurt app",
      "yurt platform",
      "yurt system",
      "yurt management",
      "rental yurt"
  ],

  synonyms: [
      "Yurt Rental platform",
      "Yurt Rental software",
      "Yurt Rental system",
      "yurt solution",
      "yurt service"
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
      "Build a yurt rental platform",
      "Create a yurt rental app",
      "I need a yurt rental management system",
      "Build a yurt rental solution",
      "Create a yurt rental booking system"
  ],
};
