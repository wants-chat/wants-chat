/**
 * Suv Rental App Type Definition
 *
 * Complete definition for suv rental applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SUV_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'suv-rental',
  name: 'Suv Rental',
  category: 'rental',
  description: 'Suv Rental platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "suv rental",
      "suv",
      "rental",
      "suv software",
      "suv app",
      "suv platform",
      "suv system",
      "suv management",
      "rental suv"
  ],

  synonyms: [
      "Suv Rental platform",
      "Suv Rental software",
      "Suv Rental system",
      "suv solution",
      "suv service"
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
      "Build a suv rental platform",
      "Create a suv rental app",
      "I need a suv rental management system",
      "Build a suv rental solution",
      "Create a suv rental booking system"
  ],
};
