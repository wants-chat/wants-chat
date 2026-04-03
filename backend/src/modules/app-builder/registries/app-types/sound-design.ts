/**
 * Sound Design App Type Definition
 *
 * Complete definition for sound design applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SOUND_DESIGN_APP_TYPE: AppTypeDefinition = {
  id: 'sound-design',
  name: 'Sound Design',
  category: 'services',
  description: 'Sound Design platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "sound design",
      "sound",
      "design",
      "sound software",
      "sound app",
      "sound platform",
      "sound system",
      "sound management",
      "services sound"
  ],

  synonyms: [
      "Sound Design platform",
      "Sound Design software",
      "Sound Design system",
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
      "Build a sound design platform",
      "Create a sound design app",
      "I need a sound design management system",
      "Build a sound design solution",
      "Create a sound design booking system"
  ],
};
