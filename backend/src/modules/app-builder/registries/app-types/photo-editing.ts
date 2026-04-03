/**
 * Photo Editing App Type Definition
 *
 * Complete definition for photo editing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PHOTO_EDITING_APP_TYPE: AppTypeDefinition = {
  id: 'photo-editing',
  name: 'Photo Editing',
  category: 'services',
  description: 'Photo Editing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "photo editing",
      "photo",
      "editing",
      "photo software",
      "photo app",
      "photo platform",
      "photo system",
      "photo management",
      "services photo"
  ],

  synonyms: [
      "Photo Editing platform",
      "Photo Editing software",
      "Photo Editing system",
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
      "Build a photo editing platform",
      "Create a photo editing app",
      "I need a photo editing management system",
      "Build a photo editing solution",
      "Create a photo editing booking system"
  ],
};
