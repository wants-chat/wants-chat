/**
 * Photo Studio App Type Definition
 *
 * Complete definition for photo studio applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PHOTO_STUDIO_APP_TYPE: AppTypeDefinition = {
  id: 'photo-studio',
  name: 'Photo Studio',
  category: 'services',
  description: 'Photo Studio platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "photo studio",
      "photo",
      "studio",
      "photo software",
      "photo app",
      "photo platform",
      "photo system",
      "photo management",
      "services photo"
  ],

  synonyms: [
      "Photo Studio platform",
      "Photo Studio software",
      "Photo Studio system",
      "photo solution",
      "photo service"
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
      "Build a photo studio platform",
      "Create a photo studio app",
      "I need a photo studio management system",
      "Build a photo studio solution",
      "Create a photo studio booking system"
  ],
};
