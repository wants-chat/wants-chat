/**
 * Photo Printing App Type Definition
 *
 * Complete definition for photo printing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PHOTO_PRINTING_APP_TYPE: AppTypeDefinition = {
  id: 'photo-printing',
  name: 'Photo Printing',
  category: 'services',
  description: 'Photo Printing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "photo printing",
      "photo",
      "printing",
      "photo software",
      "photo app",
      "photo platform",
      "photo system",
      "photo management",
      "services photo"
  ],

  synonyms: [
      "Photo Printing platform",
      "Photo Printing software",
      "Photo Printing system",
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
      "Build a photo printing platform",
      "Create a photo printing app",
      "I need a photo printing management system",
      "Build a photo printing solution",
      "Create a photo printing booking system"
  ],
};
