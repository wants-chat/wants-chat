/**
 * Body Piercing App Type Definition
 *
 * Complete definition for body piercing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BODY_PIERCING_APP_TYPE: AppTypeDefinition = {
  id: 'body-piercing',
  name: 'Body Piercing',
  category: 'services',
  description: 'Body Piercing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "body piercing",
      "body",
      "piercing",
      "body software",
      "body app",
      "body platform",
      "body system",
      "body management",
      "services body"
  ],

  synonyms: [
      "Body Piercing platform",
      "Body Piercing software",
      "Body Piercing system",
      "body solution",
      "body service"
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
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a body piercing platform",
      "Create a body piercing app",
      "I need a body piercing management system",
      "Build a body piercing solution",
      "Create a body piercing booking system"
  ],
};
