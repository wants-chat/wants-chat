/**
 * Wallpaper App Type Definition
 *
 * Complete definition for wallpaper applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WALLPAPER_APP_TYPE: AppTypeDefinition = {
  id: 'wallpaper',
  name: 'Wallpaper',
  category: 'services',
  description: 'Wallpaper platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wallpaper",
      "wallpaper software",
      "wallpaper app",
      "wallpaper platform",
      "wallpaper system",
      "wallpaper management",
      "services wallpaper"
  ],

  synonyms: [
      "Wallpaper platform",
      "Wallpaper software",
      "Wallpaper system",
      "wallpaper solution",
      "wallpaper service"
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
      "Build a wallpaper platform",
      "Create a wallpaper app",
      "I need a wallpaper management system",
      "Build a wallpaper solution",
      "Create a wallpaper booking system"
  ],
};
