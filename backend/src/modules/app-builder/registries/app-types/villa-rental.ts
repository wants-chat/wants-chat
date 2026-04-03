/**
 * Villa Rental App Type Definition
 *
 * Complete definition for villa rental applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VILLA_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'villa-rental',
  name: 'Villa Rental',
  category: 'rental',
  description: 'Villa Rental platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "villa rental",
      "villa",
      "rental",
      "villa software",
      "villa app",
      "villa platform",
      "villa system",
      "villa management",
      "rental villa"
  ],

  synonyms: [
      "Villa Rental platform",
      "Villa Rental software",
      "Villa Rental system",
      "villa solution",
      "villa service"
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
      "Build a villa rental platform",
      "Create a villa rental app",
      "I need a villa rental management system",
      "Build a villa rental solution",
      "Create a villa rental booking system"
  ],
};
