/**
 * Learning Center App Type Definition
 *
 * Complete definition for learning center applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LEARNING_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'learning-center',
  name: 'Learning Center',
  category: 'education',
  description: 'Learning Center platform with comprehensive management features',
  icon: 'graduation',

  keywords: [
      "learning center",
      "learning",
      "center",
      "learning software",
      "learning app",
      "learning platform",
      "learning system",
      "learning management",
      "education learning"
  ],

  synonyms: [
      "Learning Center platform",
      "Learning Center software",
      "Learning Center system",
      "learning solution",
      "learning service"
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
      "Build a learning center platform",
      "Create a learning center app",
      "I need a learning center management system",
      "Build a learning center solution",
      "Create a learning center booking system"
  ],
};
