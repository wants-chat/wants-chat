/**
 * Audio Post Production App Type Definition
 *
 * Complete definition for audio post production applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AUDIO_POST_PRODUCTION_APP_TYPE: AppTypeDefinition = {
  id: 'audio-post-production',
  name: 'Audio Post Production',
  category: 'services',
  description: 'Audio Post Production platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "audio post production",
      "audio",
      "post",
      "production",
      "audio software",
      "audio app",
      "audio platform",
      "audio system",
      "audio management",
      "services audio"
  ],

  synonyms: [
      "Audio Post Production platform",
      "Audio Post Production software",
      "Audio Post Production system",
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
      "Build a audio post production platform",
      "Create a audio post production app",
      "I need a audio post production management system",
      "Build a audio post production solution",
      "Create a audio post production booking system"
  ],
};
