/**
 * Sewing Machine App Type Definition
 *
 * Complete definition for sewing machine applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SEWING_MACHINE_APP_TYPE: AppTypeDefinition = {
  id: 'sewing-machine',
  name: 'Sewing Machine',
  category: 'services',
  description: 'Sewing Machine platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "sewing machine",
      "sewing",
      "machine",
      "sewing software",
      "sewing app",
      "sewing platform",
      "sewing system",
      "sewing management",
      "services sewing"
  ],

  synonyms: [
      "Sewing Machine platform",
      "Sewing Machine software",
      "Sewing Machine system",
      "sewing solution",
      "sewing service"
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
      "Build a sewing machine platform",
      "Create a sewing machine app",
      "I need a sewing machine management system",
      "Build a sewing machine solution",
      "Create a sewing machine booking system"
  ],
};
