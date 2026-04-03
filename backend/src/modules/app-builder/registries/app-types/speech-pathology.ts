/**
 * Speech Pathology App Type Definition
 *
 * Complete definition for speech pathology applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPEECH_PATHOLOGY_APP_TYPE: AppTypeDefinition = {
  id: 'speech-pathology',
  name: 'Speech Pathology',
  category: 'services',
  description: 'Speech Pathology platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "speech pathology",
      "speech",
      "pathology",
      "speech software",
      "speech app",
      "speech platform",
      "speech system",
      "speech management",
      "services speech"
  ],

  synonyms: [
      "Speech Pathology platform",
      "Speech Pathology software",
      "Speech Pathology system",
      "speech solution",
      "speech service"
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
      "Build a speech pathology platform",
      "Create a speech pathology app",
      "I need a speech pathology management system",
      "Build a speech pathology solution",
      "Create a speech pathology booking system"
  ],
};
