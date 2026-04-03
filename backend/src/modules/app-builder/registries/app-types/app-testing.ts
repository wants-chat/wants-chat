/**
 * App Testing App Type Definition
 *
 * Complete definition for app testing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const APP_TESTING_APP_TYPE: AppTypeDefinition = {
  id: 'app-testing',
  name: 'App Testing',
  category: 'technology',
  description: 'App Testing platform with comprehensive management features',
  icon: 'code',

  keywords: [
      "app testing",
      "app",
      "testing",
      "app software",
      "app app",
      "app platform",
      "app system",
      "app management",
      "technology app"
  ],

  synonyms: [
      "App Testing platform",
      "App Testing software",
      "App Testing system",
      "app solution",
      "app service"
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
      "Build a app testing platform",
      "Create a app testing app",
      "I need a app testing management system",
      "Build a app testing solution",
      "Create a app testing booking system"
  ],
};
