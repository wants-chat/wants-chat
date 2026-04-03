/**
 * Matchmaking App Type Definition
 *
 * Complete definition for matchmaking applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MATCHMAKING_APP_TYPE: AppTypeDefinition = {
  id: 'matchmaking',
  name: 'Matchmaking',
  category: 'services',
  description: 'Matchmaking platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "matchmaking",
      "matchmaking software",
      "matchmaking app",
      "matchmaking platform",
      "matchmaking system",
      "matchmaking management",
      "services matchmaking"
  ],

  synonyms: [
      "Matchmaking platform",
      "Matchmaking software",
      "Matchmaking system",
      "matchmaking solution",
      "matchmaking service"
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
      "Build a matchmaking platform",
      "Create a matchmaking app",
      "I need a matchmaking management system",
      "Build a matchmaking solution",
      "Create a matchmaking booking system"
  ],
};
