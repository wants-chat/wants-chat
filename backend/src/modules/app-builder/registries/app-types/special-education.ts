/**
 * Special Education App Type Definition
 *
 * Complete definition for special education applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPECIAL_EDUCATION_APP_TYPE: AppTypeDefinition = {
  id: 'special-education',
  name: 'Special Education',
  category: 'education',
  description: 'Special Education platform with comprehensive management features',
  icon: 'graduation',

  keywords: [
      "special education",
      "special",
      "education",
      "special software",
      "special app",
      "special platform",
      "special system",
      "special management",
      "education special"
  ],

  synonyms: [
      "Special Education platform",
      "Special Education software",
      "Special Education system",
      "special solution",
      "special service"
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
      "Build a special education platform",
      "Create a special education app",
      "I need a special education management system",
      "Build a special education solution",
      "Create a special education booking system"
  ],
};
