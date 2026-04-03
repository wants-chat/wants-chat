/**
 * Custom Software App Type Definition
 *
 * Complete definition for custom software applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CUSTOM_SOFTWARE_APP_TYPE: AppTypeDefinition = {
  id: 'custom-software',
  name: 'Custom Software',
  category: 'technology',
  description: 'Custom Software platform with comprehensive management features',
  icon: 'laptop',

  keywords: [
      "custom software",
      "custom",
      "software",
      "custom app",
      "custom platform",
      "custom system",
      "custom management",
      "technology custom"
  ],

  synonyms: [
      "Custom Software platform",
      "Custom Software software",
      "Custom Software system",
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

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a custom software platform",
      "Create a custom software app",
      "I need a custom software management system",
      "Build a custom software solution",
      "Create a custom software booking system"
  ],
};
