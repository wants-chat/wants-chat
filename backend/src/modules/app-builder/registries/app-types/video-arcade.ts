/**
 * Video Arcade App Type Definition
 *
 * Complete definition for video arcade applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VIDEO_ARCADE_APP_TYPE: AppTypeDefinition = {
  id: 'video-arcade',
  name: 'Video Arcade',
  category: 'services',
  description: 'Video Arcade platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "video arcade",
      "video",
      "arcade",
      "video software",
      "video app",
      "video platform",
      "video system",
      "video management",
      "services video"
  ],

  synonyms: [
      "Video Arcade platform",
      "Video Arcade software",
      "Video Arcade system",
      "video solution",
      "video service"
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
      "Build a video arcade platform",
      "Create a video arcade app",
      "I need a video arcade management system",
      "Build a video arcade solution",
      "Create a video arcade booking system"
  ],
};
