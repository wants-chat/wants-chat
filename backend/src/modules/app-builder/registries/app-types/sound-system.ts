/**
 * Sound System App Type Definition
 *
 * Complete definition for sound system applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SOUND_SYSTEM_APP_TYPE: AppTypeDefinition = {
  id: 'sound-system',
  name: 'Sound System',
  category: 'services',
  description: 'Sound System platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "sound system",
      "sound",
      "system",
      "sound software",
      "sound app",
      "sound platform",
      "sound management",
      "services sound"
  ],

  synonyms: [
      "Sound System platform",
      "Sound System software",
      "Sound System system",
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
      "Build a sound system platform",
      "Create a sound system app",
      "I need a sound system management system",
      "Build a sound system solution",
      "Create a sound system booking system"
  ],
};
