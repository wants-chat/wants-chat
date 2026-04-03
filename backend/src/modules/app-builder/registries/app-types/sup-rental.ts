/**
 * Sup Rental App Type Definition
 *
 * Complete definition for sup rental applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SUP_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'sup-rental',
  name: 'Sup Rental',
  category: 'rental',
  description: 'Sup Rental platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "sup rental",
      "sup",
      "rental",
      "sup software",
      "sup app",
      "sup platform",
      "sup system",
      "sup management",
      "rental sup"
  ],

  synonyms: [
      "Sup Rental platform",
      "Sup Rental software",
      "Sup Rental system",
      "sup solution",
      "sup service"
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
      "Build a sup rental platform",
      "Create a sup rental app",
      "I need a sup rental management system",
      "Build a sup rental solution",
      "Create a sup rental booking system"
  ],
};
