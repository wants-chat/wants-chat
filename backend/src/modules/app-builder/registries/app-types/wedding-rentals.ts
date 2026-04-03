/**
 * Wedding Rentals App Type Definition
 *
 * Complete definition for wedding rentals applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WEDDING_RENTALS_APP_TYPE: AppTypeDefinition = {
  id: 'wedding-rentals',
  name: 'Wedding Rentals',
  category: 'rental',
  description: 'Wedding Rentals platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "wedding rentals",
      "wedding",
      "rentals",
      "wedding software",
      "wedding app",
      "wedding platform",
      "wedding system",
      "wedding management",
      "rental wedding"
  ],

  synonyms: [
      "Wedding Rentals platform",
      "Wedding Rentals software",
      "Wedding Rentals system",
      "wedding solution",
      "wedding service"
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
      "Build a wedding rentals platform",
      "Create a wedding rentals app",
      "I need a wedding rentals management system",
      "Build a wedding rentals solution",
      "Create a wedding rentals booking system"
  ],
};
