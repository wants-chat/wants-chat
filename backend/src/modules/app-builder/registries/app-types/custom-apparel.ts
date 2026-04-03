/**
 * Custom Apparel App Type Definition
 *
 * Complete definition for custom apparel applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CUSTOM_APPAREL_APP_TYPE: AppTypeDefinition = {
  id: 'custom-apparel',
  name: 'Custom Apparel',
  category: 'technology',
  description: 'Custom Apparel platform with comprehensive management features',
  icon: 'code',

  keywords: [
      "custom apparel",
      "custom",
      "apparel",
      "custom software",
      "custom app",
      "custom platform",
      "custom system",
      "custom management",
      "technology custom"
  ],

  synonyms: [
      "Custom Apparel platform",
      "Custom Apparel software",
      "Custom Apparel system",
      "custom solution",
      "custom service"
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
      "projects",
      "tasks",
      "documents",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "time-tracking",
      "invoicing",
      "clients",
      "reporting",
      "analytics"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'technology',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a custom apparel platform",
      "Create a custom apparel app",
      "I need a custom apparel management system",
      "Build a custom apparel solution",
      "Create a custom apparel booking system"
  ],
};
