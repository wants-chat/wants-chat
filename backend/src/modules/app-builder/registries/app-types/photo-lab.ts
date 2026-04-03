/**
 * Photo Lab App Type Definition
 *
 * Complete definition for photo lab applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PHOTO_LAB_APP_TYPE: AppTypeDefinition = {
  id: 'photo-lab',
  name: 'Photo Lab',
  category: 'services',
  description: 'Photo Lab platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "photo lab",
      "photo",
      "lab",
      "photo software",
      "photo app",
      "photo platform",
      "photo system",
      "photo management",
      "services photo"
  ],

  synonyms: [
      "Photo Lab platform",
      "Photo Lab software",
      "Photo Lab system",
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
      "Build a photo lab platform",
      "Create a photo lab app",
      "I need a photo lab management system",
      "Build a photo lab solution",
      "Create a photo lab booking system"
  ],
};
