/**
 * Information Technology App Type Definition
 *
 * Complete definition for information technology applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const INFORMATION_TECHNOLOGY_APP_TYPE: AppTypeDefinition = {
  id: 'information-technology',
  name: 'Information Technology',
  category: 'technology',
  description: 'Information Technology platform with comprehensive management features',
  icon: 'code',

  keywords: [
      "information technology",
      "information",
      "technology",
      "information software",
      "information app",
      "information platform",
      "information system",
      "information management",
      "technology information"
  ],

  synonyms: [
      "Information Technology platform",
      "Information Technology software",
      "Information Technology system",
      "information solution",
      "information service"
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
      "Build a information technology platform",
      "Create a information technology app",
      "I need a information technology management system",
      "Build a information technology solution",
      "Create a information technology booking system"
  ],
};
