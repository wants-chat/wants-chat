/**
 * Rental Management App Type Definition
 *
 * Complete definition for rental management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RENTAL_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'rental-management',
  name: 'Rental Management',
  category: 'rental',
  description: 'Rental Management platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "rental management",
      "rental",
      "management",
      "rental software",
      "rental app",
      "rental platform",
      "rental system",
      "rental rental"
  ],

  synonyms: [
      "Rental Management platform",
      "Rental Management software",
      "Rental Management system",
      "rental solution",
      "rental service"
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
      "Build a rental management platform",
      "Create a rental management app",
      "I need a rental management management system",
      "Build a rental management solution",
      "Create a rental management booking system"
  ],
};
