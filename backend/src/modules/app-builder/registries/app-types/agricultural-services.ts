/**
 * Agricultural Services App Type Definition
 *
 * Complete definition for agricultural services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AGRICULTURAL_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'agricultural-services',
  name: 'Agricultural Services',
  category: 'services',
  description: 'Agricultural Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "agricultural services",
      "agricultural",
      "services",
      "agricultural software",
      "agricultural app",
      "agricultural platform",
      "agricultural system",
      "agricultural management",
      "services agricultural"
  ],

  synonyms: [
      "Agricultural Services platform",
      "Agricultural Services software",
      "Agricultural Services system",
      "agricultural solution",
      "agricultural service"
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
      "Build a agricultural services platform",
      "Create a agricultural services app",
      "I need a agricultural services management system",
      "Build a agricultural services solution",
      "Create a agricultural services booking system"
  ],
};
