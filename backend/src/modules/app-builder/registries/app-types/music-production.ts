/**
 * Music Production App Type Definition
 *
 * Complete definition for music production applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MUSIC_PRODUCTION_APP_TYPE: AppTypeDefinition = {
  id: 'music-production',
  name: 'Music Production',
  category: 'entertainment',
  description: 'Music Production platform with comprehensive management features',
  icon: 'music',

  keywords: [
      "music production",
      "music",
      "production",
      "music software",
      "music app",
      "music platform",
      "music system",
      "music management",
      "entertainment music"
  ],

  synonyms: [
      "Music Production platform",
      "Music Production software",
      "Music Production system",
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
      "Build a music production platform",
      "Create a music production app",
      "I need a music production management system",
      "Build a music production solution",
      "Create a music production booking system"
  ],
};
