/**
 * Paddle Boarding App Type Definition
 *
 * Complete definition for paddle boarding applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PADDLE_BOARDING_APP_TYPE: AppTypeDefinition = {
  id: 'paddle-boarding',
  name: 'Paddle Boarding',
  category: 'services',
  description: 'Paddle Boarding platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "paddle boarding",
      "paddle",
      "boarding",
      "paddle software",
      "paddle app",
      "paddle platform",
      "paddle system",
      "paddle management",
      "services paddle"
  ],

  synonyms: [
      "Paddle Boarding platform",
      "Paddle Boarding software",
      "Paddle Boarding system",
      "paddle solution",
      "paddle service"
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
      "Build a paddle boarding platform",
      "Create a paddle boarding app",
      "I need a paddle boarding management system",
      "Build a paddle boarding solution",
      "Create a paddle boarding booking system"
  ],
};
