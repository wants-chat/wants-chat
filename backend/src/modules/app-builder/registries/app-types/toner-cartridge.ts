/**
 * Toner Cartridge App Type Definition
 *
 * Complete definition for toner cartridge applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TONER_CARTRIDGE_APP_TYPE: AppTypeDefinition = {
  id: 'toner-cartridge',
  name: 'Toner Cartridge',
  category: 'automotive',
  description: 'Toner Cartridge platform with comprehensive management features',
  icon: 'car',

  keywords: [
      "toner cartridge",
      "toner",
      "cartridge",
      "toner software",
      "toner app",
      "toner platform",
      "toner system",
      "toner management",
      "automotive toner"
  ],

  synonyms: [
      "Toner Cartridge platform",
      "Toner Cartridge software",
      "Toner Cartridge system",
      "toner solution",
      "toner service"
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
      "vehicle-inventory",
      "appointments",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "service-scheduling",
      "parts-catalog",
      "invoicing",
      "payments",
      "reviews"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'automotive',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
      "Build a toner cartridge platform",
      "Create a toner cartridge app",
      "I need a toner cartridge management system",
      "Build a toner cartridge solution",
      "Create a toner cartridge booking system"
  ],
};
