/**
 * Audio Mixing App Type Definition
 *
 * Complete definition for audio mixing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AUDIO_MIXING_APP_TYPE: AppTypeDefinition = {
  id: 'audio-mixing',
  name: 'Audio Mixing',
  category: 'services',
  description: 'Audio Mixing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "audio mixing",
      "audio",
      "mixing",
      "audio software",
      "audio app",
      "audio platform",
      "audio system",
      "audio management",
      "services audio"
  ],

  synonyms: [
      "Audio Mixing platform",
      "Audio Mixing software",
      "Audio Mixing system",
      "audio solution",
      "audio service"
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
      "Build a audio mixing platform",
      "Create a audio mixing app",
      "I need a audio mixing management system",
      "Build a audio mixing solution",
      "Create a audio mixing booking system"
  ],
};
