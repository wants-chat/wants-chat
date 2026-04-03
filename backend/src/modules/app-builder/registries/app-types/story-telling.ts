/**
 * Story Telling App Type Definition
 *
 * Complete definition for story telling applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STORY_TELLING_APP_TYPE: AppTypeDefinition = {
  id: 'story-telling',
  name: 'Story Telling',
  category: 'services',
  description: 'Story Telling platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "story telling",
      "story",
      "telling",
      "story software",
      "story app",
      "story platform",
      "story system",
      "story management",
      "services story"
  ],

  synonyms: [
      "Story Telling platform",
      "Story Telling software",
      "Story Telling system",
      "story solution",
      "story service"
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
      "Build a story telling platform",
      "Create a story telling app",
      "I need a story telling management system",
      "Build a story telling solution",
      "Create a story telling booking system"
  ],
};
