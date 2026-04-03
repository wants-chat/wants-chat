/**
 * Student Tutoring App Type Definition
 *
 * Complete definition for student tutoring applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STUDENT_TUTORING_APP_TYPE: AppTypeDefinition = {
  id: 'student-tutoring',
  name: 'Student Tutoring',
  category: 'education',
  description: 'Student Tutoring platform with comprehensive management features',
  icon: 'book',

  keywords: [
      "student tutoring",
      "student",
      "tutoring",
      "student software",
      "student app",
      "student platform",
      "student system",
      "student management",
      "education student"
  ],

  synonyms: [
      "Student Tutoring platform",
      "Student Tutoring software",
      "Student Tutoring system",
      "student solution",
      "student service"
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
      "appointments",
      "scheduling",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "messaging",
      "documents"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'education',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
      "Build a student tutoring platform",
      "Create a student tutoring app",
      "I need a student tutoring management system",
      "Build a student tutoring solution",
      "Create a student tutoring booking system"
  ],
};
