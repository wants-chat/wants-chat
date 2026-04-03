/**
 * Versatile Services App Type Definition
 *
 * Complete definition for versatile services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VERSATILE_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'versatile-services',
  name: 'Versatile Services',
  category: 'services',
  description: 'Versatile Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "versatile services",
      "versatile",
      "services",
      "versatile software",
      "versatile app",
      "versatile platform",
      "versatile system",
      "versatile management",
      "services versatile"
  ],

  synonyms: [
      "Versatile Services platform",
      "Versatile Services software",
      "Versatile Services system",
      "versatile solution",
      "versatile service"
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
      "Build a versatile services platform",
      "Create a versatile services app",
      "I need a versatile services management system",
      "Build a versatile services solution",
      "Create a versatile services booking system"
  ],
};
