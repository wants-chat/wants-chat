/**
 * Sound Engineering App Type Definition
 *
 * Complete definition for sound engineering applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SOUND_ENGINEERING_APP_TYPE: AppTypeDefinition = {
  id: 'sound-engineering',
  name: 'Sound Engineering',
  category: 'services',
  description: 'Sound Engineering platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "sound engineering",
      "sound",
      "engineering",
      "sound software",
      "sound app",
      "sound platform",
      "sound system",
      "sound management",
      "services sound"
  ],

  synonyms: [
      "Sound Engineering platform",
      "Sound Engineering software",
      "Sound Engineering system",
      "sound solution",
      "sound service"
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
      "Build a sound engineering platform",
      "Create a sound engineering app",
      "I need a sound engineering management system",
      "Build a sound engineering solution",
      "Create a sound engineering booking system"
  ],
};
