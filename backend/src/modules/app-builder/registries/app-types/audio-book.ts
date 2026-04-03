/**
 * Audio Book App Type Definition
 *
 * Complete definition for audio book applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AUDIO_BOOK_APP_TYPE: AppTypeDefinition = {
  id: 'audio-book',
  name: 'Audio Book',
  category: 'services',
  description: 'Audio Book platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "audio book",
      "audio",
      "book",
      "audio software",
      "audio app",
      "audio platform",
      "audio system",
      "audio management",
      "services audio"
  ],

  synonyms: [
      "Audio Book platform",
      "Audio Book software",
      "Audio Book system",
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
      "Build a audio book platform",
      "Create a audio book app",
      "I need a audio book management system",
      "Build a audio book solution",
      "Create a audio book booking system"
  ],
};
