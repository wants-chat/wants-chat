/**
 * Studio Rental App Type Definition
 *
 * Complete definition for studio rental applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STUDIO_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'studio-rental',
  name: 'Studio Rental',
  category: 'rental',
  description: 'Studio Rental platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "studio rental",
      "studio",
      "rental",
      "studio software",
      "studio app",
      "studio platform",
      "studio system",
      "studio management",
      "rental studio"
  ],

  synonyms: [
      "Studio Rental platform",
      "Studio Rental software",
      "Studio Rental system",
      "studio solution",
      "studio service"
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
      "Build a studio rental platform",
      "Create a studio rental app",
      "I need a studio rental management system",
      "Build a studio rental solution",
      "Create a studio rental booking system"
  ],
};
