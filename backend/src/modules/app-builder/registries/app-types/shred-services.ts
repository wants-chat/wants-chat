/**
 * Shred Services App Type Definition
 *
 * Complete definition for shred services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SHRED_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'shred-services',
  name: 'Shred Services',
  category: 'services',
  description: 'Shred Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "shred services",
      "shred",
      "services",
      "shred software",
      "shred app",
      "shred platform",
      "shred system",
      "shred management",
      "services shred"
  ],

  synonyms: [
      "Shred Services platform",
      "Shred Services software",
      "Shred Services system",
      "shred solution",
      "shred service"
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
      "Build a shred services platform",
      "Create a shred services app",
      "I need a shred services management system",
      "Build a shred services solution",
      "Create a shred services booking system"
  ],
};
