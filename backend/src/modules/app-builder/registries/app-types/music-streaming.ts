/**
 * Music Streaming App Type Definition
 *
 * Complete definition for music streaming applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MUSIC_STREAMING_APP_TYPE: AppTypeDefinition = {
  id: 'music-streaming',
  name: 'Music Streaming',
  category: 'entertainment',
  description: 'Music Streaming platform with comprehensive management features',
  icon: 'music',

  keywords: [
      "music streaming",
      "music",
      "streaming",
      "music software",
      "music app",
      "music platform",
      "music system",
      "music management",
      "entertainment music"
  ],

  synonyms: [
      "Music Streaming platform",
      "Music Streaming software",
      "Music Streaming system",
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
      "media",
      "gallery",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "ticket-sales",
      "subscriptions",
      "payments",
      "reviews",
      "analytics"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'entertainment',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'creative',

  examplePrompts: [
      "Build a music streaming platform",
      "Create a music streaming app",
      "I need a music streaming management system",
      "Build a music streaming solution",
      "Create a music streaming booking system"
  ],
};
