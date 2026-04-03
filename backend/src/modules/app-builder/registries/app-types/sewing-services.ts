/**
 * Sewing Services App Type Definition
 *
 * Complete definition for sewing services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SEWING_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'sewing-services',
  name: 'Sewing Services',
  category: 'services',
  description: 'Sewing Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "sewing services",
      "sewing",
      "services",
      "sewing software",
      "sewing app",
      "sewing platform",
      "sewing system",
      "sewing management",
      "services sewing"
  ],

  synonyms: [
      "Sewing Services platform",
      "Sewing Services software",
      "Sewing Services system",
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
      "scheduling",
      "invoicing",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "inventory",
      "payments",
      "reviews",
      "clients",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a sewing services platform",
      "Create a sewing services app",
      "I need a sewing services management system",
      "Build a sewing services solution",
      "Create a sewing services booking system"
  ],
};
