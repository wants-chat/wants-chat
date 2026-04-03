/**
 * Arts Education App Type Definition
 *
 * Complete definition for arts education applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ARTS_EDUCATION_APP_TYPE: AppTypeDefinition = {
  id: 'arts-education',
  name: 'Arts Education',
  category: 'education',
  description: 'Arts Education platform with comprehensive management features',
  icon: 'graduation',

  keywords: [
      "arts education",
      "arts",
      "education",
      "arts software",
      "arts app",
      "arts platform",
      "arts system",
      "arts management",
      "education arts"
  ],

  synonyms: [
      "Arts Education platform",
      "Arts Education software",
      "Arts Education system",
      "arts solution",
      "arts service"
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
      "Build a arts education platform",
      "Create a arts education app",
      "I need a arts education management system",
      "Build a arts education solution",
      "Create a arts education booking system"
  ],
};
