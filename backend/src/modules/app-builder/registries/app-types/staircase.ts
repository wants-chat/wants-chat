/**
 * Staircase App Type Definition
 *
 * Complete definition for staircase applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STAIRCASE_APP_TYPE: AppTypeDefinition = {
  id: 'staircase',
  name: 'Staircase',
  category: 'services',
  description: 'Staircase platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "staircase",
      "staircase software",
      "staircase app",
      "staircase platform",
      "staircase system",
      "staircase management",
      "services staircase"
  ],

  synonyms: [
      "Staircase platform",
      "Staircase software",
      "Staircase system",
      "staircase solution",
      "staircase service"
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
      "Build a staircase platform",
      "Create a staircase app",
      "I need a staircase management system",
      "Build a staircase solution",
      "Create a staircase booking system"
  ],
};
