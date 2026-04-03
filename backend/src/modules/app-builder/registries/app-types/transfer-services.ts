/**
 * Transfer Services App Type Definition
 *
 * Complete definition for transfer services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRANSFER_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'transfer-services',
  name: 'Transfer Services',
  category: 'services',
  description: 'Transfer Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "transfer services",
      "transfer",
      "services",
      "transfer software",
      "transfer app",
      "transfer platform",
      "transfer system",
      "transfer management",
      "services transfer"
  ],

  synonyms: [
      "Transfer Services platform",
      "Transfer Services software",
      "Transfer Services system",
      "transfer solution",
      "transfer service"
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
      "Build a transfer services platform",
      "Create a transfer services app",
      "I need a transfer services management system",
      "Build a transfer services solution",
      "Create a transfer services booking system"
  ],
};
