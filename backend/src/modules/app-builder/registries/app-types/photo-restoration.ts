/**
 * Photo Restoration App Type Definition
 *
 * Complete definition for photo restoration applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PHOTO_RESTORATION_APP_TYPE: AppTypeDefinition = {
  id: 'photo-restoration',
  name: 'Photo Restoration',
  category: 'services',
  description: 'Photo Restoration platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "photo restoration",
      "photo",
      "restoration",
      "photo software",
      "photo app",
      "photo platform",
      "photo system",
      "photo management",
      "services photo"
  ],

  synonyms: [
      "Photo Restoration platform",
      "Photo Restoration software",
      "Photo Restoration system",
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
      "Build a photo restoration platform",
      "Create a photo restoration app",
      "I need a photo restoration management system",
      "Build a photo restoration solution",
      "Create a photo restoration booking system"
  ],
};
