/**
 * Violin Lessons App Type Definition
 *
 * Complete definition for violin lessons applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VIOLIN_LESSONS_APP_TYPE: AppTypeDefinition = {
  id: 'violin-lessons',
  name: 'Violin Lessons',
  category: 'services',
  description: 'Violin Lessons platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "violin lessons",
      "violin",
      "lessons",
      "violin software",
      "violin app",
      "violin platform",
      "violin system",
      "violin management",
      "services violin"
  ],

  synonyms: [
      "Violin Lessons platform",
      "Violin Lessons software",
      "Violin Lessons system",
      "violin solution",
      "violin service"
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
      "Build a violin lessons platform",
      "Create a violin lessons app",
      "I need a violin lessons management system",
      "Build a violin lessons solution",
      "Create a violin lessons booking system"
  ],
};
