/**
 * Sleep Center App Type Definition
 *
 * Complete definition for sleep center applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SLEEP_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'sleep-center',
  name: 'Sleep Center',
  category: 'services',
  description: 'Sleep Center platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "sleep center",
      "sleep",
      "center",
      "sleep software",
      "sleep app",
      "sleep platform",
      "sleep system",
      "sleep management",
      "services sleep"
  ],

  synonyms: [
      "Sleep Center platform",
      "Sleep Center software",
      "Sleep Center system",
      "sleep solution",
      "sleep service"
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
      "Build a sleep center platform",
      "Create a sleep center app",
      "I need a sleep center management system",
      "Build a sleep center solution",
      "Create a sleep center booking system"
  ],
};
