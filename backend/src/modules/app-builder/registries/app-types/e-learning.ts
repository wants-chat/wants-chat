/**
 * E Learning App Type Definition
 *
 * Complete definition for e learning applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const E_LEARNING_APP_TYPE: AppTypeDefinition = {
  id: 'e-learning',
  name: 'E Learning',
  category: 'education',
  description: 'E Learning platform with comprehensive management features',
  icon: 'graduation',

  keywords: [
      "e learning",
      "learning",
      "e software",
      "e app",
      "e platform",
      "e system",
      "e management",
      "education e"
  ],

  synonyms: [
      "E Learning platform",
      "E Learning software",
      "E Learning system",
      "e solution",
      "e service"
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
      "Build a e learning platform",
      "Create a e learning app",
      "I need a e learning management system",
      "Build a e learning solution",
      "Create a e learning booking system"
  ],
};
