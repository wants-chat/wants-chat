/**
 * Music Management App Type Definition
 *
 * Complete definition for music management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MUSIC_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'music-management',
  name: 'Music Management',
  category: 'entertainment',
  description: 'Music Management platform with comprehensive management features',
  icon: 'music',

  keywords: [
      "music management",
      "music",
      "management",
      "music software",
      "music app",
      "music platform",
      "music system",
      "entertainment music"
  ],

  synonyms: [
      "Music Management platform",
      "Music Management software",
      "Music Management system",
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
      "Build a music management platform",
      "Create a music management app",
      "I need a music management management system",
      "Build a music management solution",
      "Create a music management booking system"
  ],
};
