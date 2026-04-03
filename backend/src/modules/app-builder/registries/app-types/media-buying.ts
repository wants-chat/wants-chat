/**
 * Media Buying App Type Definition
 *
 * Complete definition for media buying applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MEDIA_BUYING_APP_TYPE: AppTypeDefinition = {
  id: 'media-buying',
  name: 'Media Buying',
  category: 'services',
  description: 'Media Buying platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "media buying",
      "media",
      "buying",
      "media software",
      "media app",
      "media platform",
      "media system",
      "media management",
      "services media"
  ],

  synonyms: [
      "Media Buying platform",
      "Media Buying software",
      "Media Buying system",
      "media solution",
      "media service"
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
      "Build a media buying platform",
      "Create a media buying app",
      "I need a media buying management system",
      "Build a media buying solution",
      "Create a media buying booking system"
  ],
};
