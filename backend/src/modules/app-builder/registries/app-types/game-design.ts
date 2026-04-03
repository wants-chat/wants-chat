/**
 * Game Design App Type Definition
 *
 * Complete definition for game design applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GAME_DESIGN_APP_TYPE: AppTypeDefinition = {
  id: 'game-design',
  name: 'Game Design',
  category: 'services',
  description: 'Game Design platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "game design",
      "game",
      "design",
      "game software",
      "game app",
      "game platform",
      "game system",
      "game management",
      "services game"
  ],

  synonyms: [
      "Game Design platform",
      "Game Design software",
      "Game Design system",
      "game solution",
      "game service"
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
      "Build a game design platform",
      "Create a game design app",
      "I need a game design management system",
      "Build a game design solution",
      "Create a game design booking system"
  ],
};
