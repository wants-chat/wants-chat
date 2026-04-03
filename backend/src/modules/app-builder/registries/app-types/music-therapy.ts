/**
 * Music Therapy App Type Definition
 *
 * Complete definition for music therapy applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MUSIC_THERAPY_APP_TYPE: AppTypeDefinition = {
  id: 'music-therapy',
  name: 'Music Therapy',
  category: 'healthcare',
  description: 'Music Therapy platform with comprehensive management features',
  icon: 'heart',

  keywords: [
      "music therapy",
      "music",
      "therapy",
      "music software",
      "music app",
      "music platform",
      "music system",
      "music management",
      "healthcare music"
  ],

  synonyms: [
      "Music Therapy platform",
      "Music Therapy software",
      "Music Therapy system",
      "music solution",
      "music service"
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
      "Build a music therapy platform",
      "Create a music therapy app",
      "I need a music therapy management system",
      "Build a music therapy solution",
      "Create a music therapy booking system"
  ],
};
