/**
 * Welfare Services App Type Definition
 *
 * Complete definition for welfare services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WELFARE_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'welfare-services',
  name: 'Welfare Services',
  category: 'services',
  description: 'Welfare Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "welfare services",
      "welfare",
      "services",
      "welfare software",
      "welfare app",
      "welfare platform",
      "welfare system",
      "welfare management",
      "services welfare"
  ],

  synonyms: [
      "Welfare Services platform",
      "Welfare Services software",
      "Welfare Services system",
      "welfare solution",
      "welfare service"
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
      "Build a welfare services platform",
      "Create a welfare services app",
      "I need a welfare services management system",
      "Build a welfare services solution",
      "Create a welfare services booking system"
  ],
};
