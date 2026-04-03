/**
 * Clothing Rental App Type Definition
 *
 * Complete definition for clothing rental applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CLOTHING_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'clothing-rental',
  name: 'Clothing Rental',
  category: 'rental',
  description: 'Clothing Rental platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "clothing rental",
      "clothing",
      "rental",
      "clothing software",
      "clothing app",
      "clothing platform",
      "clothing system",
      "clothing management",
      "rental clothing"
  ],

  synonyms: [
      "Clothing Rental platform",
      "Clothing Rental software",
      "Clothing Rental system",
      "clothing solution",
      "clothing service"
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
      "Build a clothing rental platform",
      "Create a clothing rental app",
      "I need a clothing rental management system",
      "Build a clothing rental solution",
      "Create a clothing rental booking system"
  ],
};
