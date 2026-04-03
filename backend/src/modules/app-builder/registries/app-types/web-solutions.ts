/**
 * Web Solutions App Type Definition
 *
 * Complete definition for web solutions applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WEB_SOLUTIONS_APP_TYPE: AppTypeDefinition = {
  id: 'web-solutions',
  name: 'Web Solutions',
  category: 'technology',
  description: 'Web Solutions platform with comprehensive management features',
  icon: 'code',

  keywords: [
      "web solutions",
      "web",
      "solutions",
      "web software",
      "web app",
      "web platform",
      "web system",
      "web management",
      "technology web"
  ],

  synonyms: [
      "Web Solutions platform",
      "Web Solutions software",
      "Web Solutions system",
      "web solution",
      "web service"
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
      "Build a web solutions platform",
      "Create a web solutions app",
      "I need a web solutions management system",
      "Build a web solutions solution",
      "Create a web solutions booking system"
  ],
};
