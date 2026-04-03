/**
 * Piano Lessons App Type Definition
 *
 * Complete definition for piano lessons applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PIANO_LESSONS_APP_TYPE: AppTypeDefinition = {
  id: 'piano-lessons',
  name: 'Piano Lessons',
  category: 'services',
  description: 'Piano Lessons platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "piano lessons",
      "piano",
      "lessons",
      "piano software",
      "piano app",
      "piano platform",
      "piano system",
      "piano management",
      "services piano"
  ],

  synonyms: [
      "Piano Lessons platform",
      "Piano Lessons software",
      "Piano Lessons system",
      "piano solution",
      "piano service"
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
      "Build a piano lessons platform",
      "Create a piano lessons app",
      "I need a piano lessons management system",
      "Build a piano lessons solution",
      "Create a piano lessons booking system"
  ],
};
