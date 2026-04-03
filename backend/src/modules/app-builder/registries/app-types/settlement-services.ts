/**
 * Settlement Services App Type Definition
 *
 * Complete definition for settlement services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SETTLEMENT_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'settlement-services',
  name: 'Settlement Services',
  category: 'services',
  description: 'Settlement Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "settlement services",
      "settlement",
      "services",
      "settlement software",
      "settlement app",
      "settlement platform",
      "settlement system",
      "settlement management",
      "services settlement"
  ],

  synonyms: [
      "Settlement Services platform",
      "Settlement Services software",
      "Settlement Services system",
      "settlement solution",
      "settlement service"
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
      "Build a settlement services platform",
      "Create a settlement services app",
      "I need a settlement services management system",
      "Build a settlement services solution",
      "Create a settlement services booking system"
  ],
};
