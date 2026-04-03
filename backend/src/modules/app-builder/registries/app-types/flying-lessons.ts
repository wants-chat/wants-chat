/**
 * Flying Lessons App Type Definition
 *
 * Complete definition for flying lessons applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FLYING_LESSONS_APP_TYPE: AppTypeDefinition = {
  id: 'flying-lessons',
  name: 'Flying Lessons',
  category: 'services',
  description: 'Flying Lessons platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "flying lessons",
      "flying",
      "lessons",
      "flying software",
      "flying app",
      "flying platform",
      "flying system",
      "flying management",
      "services flying"
  ],

  synonyms: [
      "Flying Lessons platform",
      "Flying Lessons software",
      "Flying Lessons system",
      "flying solution",
      "flying service"
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
      "Build a flying lessons platform",
      "Create a flying lessons app",
      "I need a flying lessons management system",
      "Build a flying lessons solution",
      "Create a flying lessons booking system"
  ],
};
