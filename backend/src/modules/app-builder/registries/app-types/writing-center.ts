/**
 * Writing Center App Type Definition
 *
 * Complete definition for writing center applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WRITING_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'writing-center',
  name: 'Writing Center',
  category: 'services',
  description: 'Writing Center platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "writing center",
      "writing",
      "center",
      "writing software",
      "writing app",
      "writing platform",
      "writing system",
      "writing management",
      "services writing"
  ],

  synonyms: [
      "Writing Center platform",
      "Writing Center software",
      "Writing Center system",
      "writing solution",
      "writing service"
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
      "Build a writing center platform",
      "Create a writing center app",
      "I need a writing center management system",
      "Build a writing center solution",
      "Create a writing center booking system"
  ],
};
