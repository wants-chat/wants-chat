/**
 * Short Term Rental App Type Definition
 *
 * Complete definition for short term rental applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SHORT_TERM_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'short-term-rental',
  name: 'Short Term Rental',
  category: 'rental',
  description: 'Short Term Rental platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "short term rental",
      "short",
      "term",
      "rental",
      "short software",
      "short app",
      "short platform",
      "short system",
      "short management",
      "rental short"
  ],

  synonyms: [
      "Short Term Rental platform",
      "Short Term Rental software",
      "Short Term Rental system",
      "short solution",
      "short service"
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
      "Build a short term rental platform",
      "Create a short term rental app",
      "I need a short term rental management system",
      "Build a short term rental solution",
      "Create a short term rental booking system"
  ],
};
