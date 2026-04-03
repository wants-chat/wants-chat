/**
 * Electrical Supply App Type Definition
 *
 * Complete definition for electrical supply applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ELECTRICAL_SUPPLY_APP_TYPE: AppTypeDefinition = {
  id: 'electrical-supply',
  name: 'Electrical Supply',
  category: 'construction',
  description: 'Electrical Supply platform with comprehensive management features',
  icon: 'bolt',

  keywords: [
      "electrical supply",
      "electrical",
      "supply",
      "electrical software",
      "electrical app",
      "electrical platform",
      "electrical system",
      "electrical management",
      "trades electrical"
  ],

  synonyms: [
      "Electrical Supply platform",
      "Electrical Supply software",
      "Electrical Supply system",
      "electrical solution",
      "electrical service"
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
      "appointments",
      "scheduling",
      "invoicing",
      "clients",
      "notifications"
  ],

  optionalFeatures: [
      "inventory",
      "payments",
      "reviews",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'trades',

  defaultColorScheme: 'yellow',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a electrical supply platform",
      "Create a electrical supply app",
      "I need a electrical supply management system",
      "Build a electrical supply solution",
      "Create a electrical supply booking system"
  ],
};
