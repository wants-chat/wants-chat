/**
 * Restoration Services App Type Definition
 *
 * Complete definition for restoration services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RESTORATION_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'restoration-services',
  name: 'Restoration Services',
  category: 'services',
  description: 'Restoration Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "restoration services",
      "restoration",
      "services",
      "restoration software",
      "restoration app",
      "restoration platform",
      "restoration system",
      "restoration management",
      "services restoration"
  ],

  synonyms: [
      "Restoration Services platform",
      "Restoration Services software",
      "Restoration Services system",
      "restoration solution",
      "restoration service"
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
      "Build a restoration services platform",
      "Create a restoration services app",
      "I need a restoration services management system",
      "Build a restoration services solution",
      "Create a restoration services booking system"
  ],
};
