/**
 * Sound Therapy App Type Definition
 *
 * Complete definition for sound therapy applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SOUND_THERAPY_APP_TYPE: AppTypeDefinition = {
  id: 'sound-therapy',
  name: 'Sound Therapy',
  category: 'healthcare',
  description: 'Sound Therapy platform with comprehensive management features',
  icon: 'heart',

  keywords: [
      "sound therapy",
      "sound",
      "therapy",
      "sound software",
      "sound app",
      "sound platform",
      "sound system",
      "sound management",
      "healthcare sound"
  ],

  synonyms: [
      "Sound Therapy platform",
      "Sound Therapy software",
      "Sound Therapy system",
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
          "name": "Practice Owner",
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
          "name": "Healthcare Provider",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "Patient",
          "level": 10,
          "isDefault": true,
          "accessibleSections": [
              "frontend"
          ],
          "defaultRoute": "/appointments"
      }
  ],

  defaultFeatures: [
      "user-auth",
      "appointments",
      "calendar",
      "scheduling",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "treatment-plans",
      "documents",
      "invoicing",
      "payments",
      "messaging"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'healthcare',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'calm',

  examplePrompts: [
      "Build a sound therapy platform",
      "Create a sound therapy app",
      "I need a sound therapy management system",
      "Build a sound therapy solution",
      "Create a sound therapy booking system"
  ],
};
