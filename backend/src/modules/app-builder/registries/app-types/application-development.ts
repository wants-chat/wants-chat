/**
 * Application Development App Type Definition
 *
 * Complete definition for application development applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const APPLICATION_DEVELOPMENT_APP_TYPE: AppTypeDefinition = {
  id: 'application-development',
  name: 'Application Development',
  category: 'technology',
  description: 'Application Development platform with comprehensive management features',
  icon: 'code',

  keywords: [
      "application development",
      "application",
      "development",
      "application software",
      "application app",
      "application platform",
      "application system",
      "application management",
      "technology application"
  ],

  synonyms: [
      "Application Development platform",
      "Application Development software",
      "Application Development system",
      "application solution",
      "application service"
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
      "Build a application development platform",
      "Create a application development app",
      "I need a application development management system",
      "Build a application development solution",
      "Create a application development booking system"
  ],
};
