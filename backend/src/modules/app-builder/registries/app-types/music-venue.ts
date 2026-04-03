/**
 * Music Venue App Type Definition
 *
 * Complete definition for music venue applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MUSIC_VENUE_APP_TYPE: AppTypeDefinition = {
  id: 'music-venue',
  name: 'Music Venue',
  category: 'entertainment',
  description: 'Music Venue platform with comprehensive management features',
  icon: 'building',

  keywords: [
      "music venue",
      "music",
      "venue",
      "music software",
      "music app",
      "music platform",
      "music system",
      "music management",
      "events music"
  ],

  synonyms: [
      "Music Venue platform",
      "Music Venue software",
      "Music Venue system",
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
      "venue-booking",
      "reservations",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "seating-charts",
      "payments",
      "gallery",
      "reviews",
      "contracts"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'events',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
      "Build a music venue platform",
      "Create a music venue app",
      "I need a music venue management system",
      "Build a music venue solution",
      "Create a music venue booking system"
  ],
};
