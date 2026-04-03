/**
 * Pallet Manufacturing App Type Definition
 *
 * Complete definition for pallet manufacturing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PALLET_MANUFACTURING_APP_TYPE: AppTypeDefinition = {
  id: 'pallet-manufacturing',
  name: 'Pallet Manufacturing',
  category: 'services',
  description: 'Pallet Manufacturing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "pallet manufacturing",
      "pallet",
      "manufacturing",
      "pallet software",
      "pallet app",
      "pallet platform",
      "pallet system",
      "pallet management",
      "services pallet"
  ],

  synonyms: [
      "Pallet Manufacturing platform",
      "Pallet Manufacturing software",
      "Pallet Manufacturing system",
      "pallet solution",
      "pallet service"
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
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a pallet manufacturing platform",
      "Create a pallet manufacturing app",
      "I need a pallet manufacturing management system",
      "Build a pallet manufacturing solution",
      "Create a pallet manufacturing booking system"
  ],
};
