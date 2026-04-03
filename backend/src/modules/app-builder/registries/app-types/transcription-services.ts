/**
 * Transcription Services App Type Definition
 *
 * Complete definition for transcription services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRANSCRIPTION_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'transcription-services',
  name: 'Transcription Services',
  category: 'services',
  description: 'Transcription Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "transcription services",
      "transcription",
      "services",
      "transcription software",
      "transcription app",
      "transcription platform",
      "transcription system",
      "transcription management",
      "services transcription"
  ],

  synonyms: [
      "Transcription Services platform",
      "Transcription Services software",
      "Transcription Services system",
      "transcription solution",
      "transcription service"
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
      "scheduling",
      "invoicing",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "inventory",
      "payments",
      "reviews",
      "clients",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a transcription services platform",
      "Create a transcription services app",
      "I need a transcription services management system",
      "Build a transcription services solution",
      "Create a transcription services booking system"
  ],
};
