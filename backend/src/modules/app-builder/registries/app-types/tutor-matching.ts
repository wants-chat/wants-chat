/**
 * Tutor Matching App Type Definition
 *
 * Complete definition for tutor matching applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TUTOR_MATCHING_APP_TYPE: AppTypeDefinition = {
  id: 'tutor-matching',
  name: 'Tutor Matching',
  category: 'education',
  description: 'Tutor Matching platform with comprehensive management features',
  icon: 'graduation',

  keywords: [
      "tutor matching",
      "tutor",
      "matching",
      "tutor software",
      "tutor app",
      "tutor platform",
      "tutor system",
      "tutor management",
      "education tutor"
  ],

  synonyms: [
      "Tutor Matching platform",
      "Tutor Matching software",
      "Tutor Matching system",
      "tutor solution",
      "tutor service"
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
      "Build a tutor matching platform",
      "Create a tutor matching app",
      "I need a tutor matching management system",
      "Build a tutor matching solution",
      "Create a tutor matching booking system"
  ],
};
