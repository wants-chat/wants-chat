/**
 * Uniform Rental App Type Definition
 *
 * Complete definition for uniform rental applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const UNIFORM_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'uniform-rental',
  name: 'Uniform Rental',
  category: 'rental',
  description: 'Uniform Rental platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "uniform rental",
      "uniform",
      "rental",
      "uniform software",
      "uniform app",
      "uniform platform",
      "uniform system",
      "uniform management",
      "rental uniform"
  ],

  synonyms: [
      "Uniform Rental platform",
      "Uniform Rental software",
      "Uniform Rental system",
      "uniform solution",
      "uniform service"
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
      "Build a uniform rental platform",
      "Create a uniform rental app",
      "I need a uniform rental management system",
      "Build a uniform rental solution",
      "Create a uniform rental booking system"
  ],
};
