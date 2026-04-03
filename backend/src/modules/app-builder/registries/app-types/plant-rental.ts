/**
 * Plant Rental App Type Definition
 *
 * Complete definition for plant rental applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PLANT_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'plant-rental',
  name: 'Plant Rental',
  category: 'rental',
  description: 'Plant Rental platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "plant rental",
      "plant",
      "rental",
      "plant software",
      "plant app",
      "plant platform",
      "plant system",
      "plant management",
      "rental plant"
  ],

  synonyms: [
      "Plant Rental platform",
      "Plant Rental software",
      "Plant Rental system",
      "plant solution",
      "plant service"
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
      "Build a plant rental platform",
      "Create a plant rental app",
      "I need a plant rental management system",
      "Build a plant rental solution",
      "Create a plant rental booking system"
  ],
};
