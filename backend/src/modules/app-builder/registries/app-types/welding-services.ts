/**
 * Welding Services App Type Definition
 *
 * Complete definition for welding services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WELDING_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'welding-services',
  name: 'Welding Services',
  category: 'services',
  description: 'Welding Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "welding services",
      "welding",
      "services",
      "welding software",
      "welding app",
      "welding platform",
      "welding system",
      "welding management",
      "services welding"
  ],

  synonyms: [
      "Welding Services platform",
      "Welding Services software",
      "Welding Services system",
      "welding solution",
      "welding service"
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
      "Build a welding services platform",
      "Create a welding services app",
      "I need a welding services management system",
      "Build a welding services solution",
      "Create a welding services booking system"
  ],
};
