/**
 * Wild Game App Type Definition
 *
 * Complete definition for wild game applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WILD_GAME_APP_TYPE: AppTypeDefinition = {
  id: 'wild-game',
  name: 'Wild Game',
  category: 'services',
  description: 'Wild Game platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wild game",
      "wild",
      "game",
      "wild software",
      "wild app",
      "wild platform",
      "wild system",
      "wild management",
      "services wild"
  ],

  synonyms: [
      "Wild Game platform",
      "Wild Game software",
      "Wild Game system",
      "wild solution",
      "wild service"
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
      "Build a wild game platform",
      "Create a wild game app",
      "I need a wild game management system",
      "Build a wild game solution",
      "Create a wild game booking system"
  ],
};
