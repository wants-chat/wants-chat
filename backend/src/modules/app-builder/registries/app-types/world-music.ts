/**
 * World Music App Type Definition
 *
 * Complete definition for world music applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WORLD_MUSIC_APP_TYPE: AppTypeDefinition = {
  id: 'world-music',
  name: 'World Music',
  category: 'entertainment',
  description: 'World Music platform with comprehensive management features',
  icon: 'music',

  keywords: [
      "world music",
      "world",
      "music",
      "world software",
      "world app",
      "world platform",
      "world system",
      "world management",
      "entertainment world"
  ],

  synonyms: [
      "World Music platform",
      "World Music software",
      "World Music system",
      "world solution",
      "world service"
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
      "Build a world music platform",
      "Create a world music app",
      "I need a world music management system",
      "Build a world music solution",
      "Create a world music booking system"
  ],
};
