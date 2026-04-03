/**
 * Appliance Rental App Type Definition
 *
 * Complete definition for appliance rental applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const APPLIANCE_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'appliance-rental',
  name: 'Appliance Rental',
  category: 'rental',
  description: 'Appliance Rental platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "appliance rental",
      "appliance",
      "rental",
      "appliance software",
      "appliance app",
      "appliance platform",
      "appliance system",
      "appliance management",
      "rental appliance"
  ],

  synonyms: [
      "Appliance Rental platform",
      "Appliance Rental software",
      "Appliance Rental system",
      "appliance solution",
      "appliance service"
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
      "Build a appliance rental platform",
      "Create a appliance rental app",
      "I need a appliance rental management system",
      "Build a appliance rental solution",
      "Create a appliance rental booking system"
  ],
};
