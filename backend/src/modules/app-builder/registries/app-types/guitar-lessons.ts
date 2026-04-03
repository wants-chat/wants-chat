/**
 * Guitar Lessons App Type Definition
 *
 * Complete definition for guitar lessons applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GUITAR_LESSONS_APP_TYPE: AppTypeDefinition = {
  id: 'guitar-lessons',
  name: 'Guitar Lessons',
  category: 'services',
  description: 'Guitar Lessons platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "guitar lessons",
      "guitar",
      "lessons",
      "guitar software",
      "guitar app",
      "guitar platform",
      "guitar system",
      "guitar management",
      "services guitar"
  ],

  synonyms: [
      "Guitar Lessons platform",
      "Guitar Lessons software",
      "Guitar Lessons system",
      "guitar solution",
      "guitar service"
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
      "Build a guitar lessons platform",
      "Create a guitar lessons app",
      "I need a guitar lessons management system",
      "Build a guitar lessons solution",
      "Create a guitar lessons booking system"
  ],
};
