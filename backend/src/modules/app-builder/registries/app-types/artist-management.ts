/**
 * Artist Management App Type Definition
 *
 * Complete definition for artist management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ARTIST_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'artist-management',
  name: 'Artist Management',
  category: 'services',
  description: 'Artist Management platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "artist management",
      "artist",
      "management",
      "artist software",
      "artist app",
      "artist platform",
      "artist system",
      "services artist"
  ],

  synonyms: [
      "Artist Management platform",
      "Artist Management software",
      "Artist Management system",
      "artist solution",
      "artist service"
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
      "Build a artist management platform",
      "Create a artist management app",
      "I need a artist management management system",
      "Build a artist management solution",
      "Create a artist management booking system"
  ],
};
