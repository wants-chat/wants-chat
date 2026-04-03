/**
 * Talk Show App Type Definition
 *
 * Complete definition for talk show applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TALK_SHOW_APP_TYPE: AppTypeDefinition = {
  id: 'talk-show',
  name: 'Talk Show',
  category: 'services',
  description: 'Talk Show platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "talk show",
      "talk",
      "show",
      "talk software",
      "talk app",
      "talk platform",
      "talk system",
      "talk management",
      "services talk"
  ],

  synonyms: [
      "Talk Show platform",
      "Talk Show software",
      "Talk Show system",
      "talk solution",
      "talk service"
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
      "Build a talk show platform",
      "Create a talk show app",
      "I need a talk show management system",
      "Build a talk show solution",
      "Create a talk show booking system"
  ],
};
