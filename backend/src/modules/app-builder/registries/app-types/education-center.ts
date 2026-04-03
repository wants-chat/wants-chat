/**
 * Education Center App Type Definition
 *
 * Complete definition for education center applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const EDUCATION_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'education-center',
  name: 'Education Center',
  category: 'education',
  description: 'Education Center platform with comprehensive management features',
  icon: 'graduation',

  keywords: [
      "education center",
      "education",
      "center",
      "education software",
      "education app",
      "education platform",
      "education system",
      "education management",
      "education education"
  ],

  synonyms: [
      "Education Center platform",
      "Education Center software",
      "Education Center system",
      "education solution",
      "education service"
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
      "Build a education center platform",
      "Create a education center app",
      "I need a education center management system",
      "Build a education center solution",
      "Create a education center booking system"
  ],
};
