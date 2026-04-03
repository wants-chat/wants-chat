/**
 * Wake Board App Type Definition
 *
 * Complete definition for wake board applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WAKE_BOARD_APP_TYPE: AppTypeDefinition = {
  id: 'wake-board',
  name: 'Wake Board',
  category: 'services',
  description: 'Wake Board platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wake board",
      "wake",
      "board",
      "wake software",
      "wake app",
      "wake platform",
      "wake system",
      "wake management",
      "services wake"
  ],

  synonyms: [
      "Wake Board platform",
      "Wake Board software",
      "Wake Board system",
      "wake solution",
      "wake service"
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
      "Build a wake board platform",
      "Create a wake board app",
      "I need a wake board management system",
      "Build a wake board solution",
      "Create a wake board booking system"
  ],
};
