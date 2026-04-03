/**
 * Steam Room App Type Definition
 *
 * Complete definition for steam room applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STEAM_ROOM_APP_TYPE: AppTypeDefinition = {
  id: 'steam-room',
  name: 'Steam Room',
  category: 'services',
  description: 'Steam Room platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "steam room",
      "steam",
      "room",
      "steam software",
      "steam app",
      "steam platform",
      "steam system",
      "steam management",
      "services steam"
  ],

  synonyms: [
      "Steam Room platform",
      "Steam Room software",
      "Steam Room system",
      "steam solution",
      "steam service"
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
      "Build a steam room platform",
      "Create a steam room app",
      "I need a steam room management system",
      "Build a steam room solution",
      "Create a steam room booking system"
  ],
};
