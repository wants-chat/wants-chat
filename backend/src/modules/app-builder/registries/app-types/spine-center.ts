/**
 * Spine Center App Type Definition
 *
 * Complete definition for spine center applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPINE_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'spine-center',
  name: 'Spine Center',
  category: 'services',
  description: 'Spine Center platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "spine center",
      "spine",
      "center",
      "spine software",
      "spine app",
      "spine platform",
      "spine system",
      "spine management",
      "services spine"
  ],

  synonyms: [
      "Spine Center platform",
      "Spine Center software",
      "Spine Center system",
      "spine solution",
      "spine service"
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
      "Build a spine center platform",
      "Create a spine center app",
      "I need a spine center management system",
      "Build a spine center solution",
      "Create a spine center booking system"
  ],
};
