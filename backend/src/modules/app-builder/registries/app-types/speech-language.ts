/**
 * Speech Language App Type Definition
 *
 * Complete definition for speech language applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPEECH_LANGUAGE_APP_TYPE: AppTypeDefinition = {
  id: 'speech-language',
  name: 'Speech Language',
  category: 'services',
  description: 'Speech Language platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "speech language",
      "speech",
      "language",
      "speech software",
      "speech app",
      "speech platform",
      "speech system",
      "speech management",
      "services speech"
  ],

  synonyms: [
      "Speech Language platform",
      "Speech Language software",
      "Speech Language system",
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
      "Build a speech language platform",
      "Create a speech language app",
      "I need a speech language management system",
      "Build a speech language solution",
      "Create a speech language booking system"
  ],
};
