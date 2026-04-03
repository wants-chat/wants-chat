/**
 * Music Education App Type Definition
 *
 * Complete definition for music education applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MUSIC_EDUCATION_APP_TYPE: AppTypeDefinition = {
  id: 'music-education',
  name: 'Music Education',
  category: 'education',
  description: 'Music Education platform with comprehensive management features',
  icon: 'graduation',

  keywords: [
      "music education",
      "music",
      "education",
      "music software",
      "music app",
      "music platform",
      "music system",
      "music management",
      "education music"
  ],

  synonyms: [
      "Music Education platform",
      "Music Education software",
      "Music Education system",
      "music solution",
      "music service"
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
          "name": "Instructor",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "Student",
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
      "course-management",
      "student-records",
      "assignments",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "grading",
      "attendance",
      "lms",
      "certificates",
      "parent-portal"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'education',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'clean',

  examplePrompts: [
      "Build a music education platform",
      "Create a music education app",
      "I need a music education management system",
      "Build a music education solution",
      "Create a music education booking system"
  ],
};
