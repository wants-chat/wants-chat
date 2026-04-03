/**
 * Tax Services App Type Definition
 *
 * Complete definition for tax services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TAX_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'tax-services',
  name: 'Tax Services',
  category: 'services',
  description: 'Tax Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "tax services",
      "tax",
      "services",
      "tax software",
      "tax app",
      "tax platform",
      "tax system",
      "tax management",
      "services tax"
  ],

  synonyms: [
      "Tax Services platform",
      "Tax Services software",
      "Tax Services system",
      "tax solution",
      "tax service"
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
      "Build a tax services platform",
      "Create a tax services app",
      "I need a tax services management system",
      "Build a tax services solution",
      "Create a tax services booking system"
  ],
};
