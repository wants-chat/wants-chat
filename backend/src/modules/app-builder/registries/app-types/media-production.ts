/**
 * Media Production App Type Definition
 *
 * Complete definition for media production applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MEDIA_PRODUCTION_APP_TYPE: AppTypeDefinition = {
  id: 'media-production',
  name: 'Media Production',
  category: 'services',
  description: 'Media Production platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "media production",
      "media",
      "production",
      "media software",
      "media app",
      "media platform",
      "media system",
      "media management",
      "services media"
  ],

  synonyms: [
      "Media Production platform",
      "Media Production software",
      "Media Production system",
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
      "Build a media production platform",
      "Create a media production app",
      "I need a media production management system",
      "Build a media production solution",
      "Create a media production booking system"
  ],
};
