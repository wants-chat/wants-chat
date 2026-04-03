/**
 * Sun Room App Type Definition
 *
 * Complete definition for sun room applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SUN_ROOM_APP_TYPE: AppTypeDefinition = {
  id: 'sun-room',
  name: 'Sun Room',
  category: 'services',
  description: 'Sun Room platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "sun room",
      "sun",
      "room",
      "sun software",
      "sun app",
      "sun platform",
      "sun system",
      "sun management",
      "services sun"
  ],

  synonyms: [
      "Sun Room platform",
      "Sun Room software",
      "Sun Room system",
      "sun solution",
      "sun service"
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
      "Build a sun room platform",
      "Create a sun room app",
      "I need a sun room management system",
      "Build a sun room solution",
      "Create a sun room booking system"
  ],
};
