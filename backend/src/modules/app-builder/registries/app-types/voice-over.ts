/**
 * Voice Over App Type Definition
 *
 * Complete definition for voice over applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VOICE_OVER_APP_TYPE: AppTypeDefinition = {
  id: 'voice-over',
  name: 'Voice Over',
  category: 'services',
  description: 'Voice Over platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "voice over",
      "voice",
      "over",
      "voice software",
      "voice app",
      "voice platform",
      "voice system",
      "voice management",
      "services voice"
  ],

  synonyms: [
      "Voice Over platform",
      "Voice Over software",
      "Voice Over system",
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
      "Build a voice over platform",
      "Create a voice over app",
      "I need a voice over management system",
      "Build a voice over solution",
      "Create a voice over booking system"
  ],
};
