/**
 * Audio Engineering App Type Definition
 *
 * Complete definition for audio engineering applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AUDIO_ENGINEERING_APP_TYPE: AppTypeDefinition = {
  id: 'audio-engineering',
  name: 'Audio Engineering',
  category: 'services',
  description: 'Audio Engineering platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "audio engineering",
      "audio",
      "engineering",
      "audio software",
      "audio app",
      "audio platform",
      "audio system",
      "audio management",
      "services audio"
  ],

  synonyms: [
      "Audio Engineering platform",
      "Audio Engineering software",
      "Audio Engineering system",
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
      "Build a audio engineering platform",
      "Create a audio engineering app",
      "I need a audio engineering management system",
      "Build a audio engineering solution",
      "Create a audio engineering booking system"
  ],
};
