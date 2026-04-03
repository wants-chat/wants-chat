/**
 * Video Conference App Type Definition
 *
 * Complete definition for video conference applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VIDEO_CONFERENCE_APP_TYPE: AppTypeDefinition = {
  id: 'video-conference',
  name: 'Video Conference',
  category: 'services',
  description: 'Video Conference platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "video conference",
      "video",
      "conference",
      "video software",
      "video app",
      "video platform",
      "video system",
      "video management",
      "services video"
  ],

  synonyms: [
      "Video Conference platform",
      "Video Conference software",
      "Video Conference system",
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
      "Build a video conference platform",
      "Create a video conference app",
      "I need a video conference management system",
      "Build a video conference solution",
      "Create a video conference booking system"
  ],
};
