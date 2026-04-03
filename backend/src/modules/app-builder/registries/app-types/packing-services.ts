/**
 * Packing Services App Type Definition
 *
 * Complete definition for packing services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PACKING_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'packing-services',
  name: 'Packing Services',
  category: 'services',
  description: 'Packing Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "packing services",
      "packing",
      "services",
      "packing software",
      "packing app",
      "packing platform",
      "packing system",
      "packing management",
      "services packing"
  ],

  synonyms: [
      "Packing Services platform",
      "Packing Services software",
      "Packing Services system",
      "packing solution",
      "packing service"
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
      "Build a packing services platform",
      "Create a packing services app",
      "I need a packing services management system",
      "Build a packing services solution",
      "Create a packing services booking system"
  ],
};
