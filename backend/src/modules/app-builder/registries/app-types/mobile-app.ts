/**
 * Mobile App App Type Definition
 *
 * Complete definition for mobile app applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MOBILE_APP_APP_TYPE: AppTypeDefinition = {
  id: 'mobile-app',
  name: 'Mobile App',
  category: 'technology',
  description: 'Mobile App platform with comprehensive management features',
  icon: 'code',

  keywords: [
      "mobile app",
      "mobile",
      "app",
      "mobile software",
      "mobile platform",
      "mobile system",
      "mobile management",
      "technology mobile"
  ],

  synonyms: [
      "Mobile App platform",
      "Mobile App software",
      "Mobile App system",
      "mobile solution",
      "mobile service"
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
      "Build a mobile app platform",
      "Create a mobile app app",
      "I need a mobile app management system",
      "Build a mobile app solution",
      "Create a mobile app booking system"
  ],
};
