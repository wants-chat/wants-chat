/**
 * Office Services App Type Definition
 *
 * Complete definition for office services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const OFFICE_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'office-services',
  name: 'Office Services',
  category: 'services',
  description: 'Office Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "office services",
      "office",
      "services",
      "office software",
      "office app",
      "office platform",
      "office system",
      "office management",
      "services office"
  ],

  synonyms: [
      "Office Services platform",
      "Office Services software",
      "Office Services system",
      "office solution",
      "office service"
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
      "Build a office services platform",
      "Create a office services app",
      "I need a office services management system",
      "Build a office services solution",
      "Create a office services booking system"
  ],
};
