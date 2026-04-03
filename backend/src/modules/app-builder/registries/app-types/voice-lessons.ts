/**
 * Voice Lessons App Type Definition
 *
 * Complete definition for voice lessons applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VOICE_LESSONS_APP_TYPE: AppTypeDefinition = {
  id: 'voice-lessons',
  name: 'Voice Lessons',
  category: 'services',
  description: 'Voice Lessons platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "voice lessons",
      "voice",
      "lessons",
      "voice software",
      "voice app",
      "voice platform",
      "voice system",
      "voice management",
      "services voice"
  ],

  synonyms: [
      "Voice Lessons platform",
      "Voice Lessons software",
      "Voice Lessons system",
      "voice solution",
      "voice service"
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
      "Build a voice lessons platform",
      "Create a voice lessons app",
      "I need a voice lessons management system",
      "Build a voice lessons solution",
      "Create a voice lessons booking system"
  ],
};
