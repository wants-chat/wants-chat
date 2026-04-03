/**
 * Tap Dance App Type Definition
 *
 * Complete definition for tap dance applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TAP_DANCE_APP_TYPE: AppTypeDefinition = {
  id: 'tap-dance',
  name: 'Tap Dance',
  category: 'services',
  description: 'Tap Dance platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tap dance",
      "tap",
      "dance",
      "tap software",
      "tap app",
      "tap platform",
      "tap system",
      "tap management",
      "services tap"
  ],

  synonyms: [
      "Tap Dance platform",
      "Tap Dance software",
      "Tap Dance system",
      "tap solution",
      "tap service"
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
      "Build a tap dance platform",
      "Create a tap dance app",
      "I need a tap dance management system",
      "Build a tap dance solution",
      "Create a tap dance booking system"
  ],
};
