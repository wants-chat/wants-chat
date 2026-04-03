/**
 * Youth Education App Type Definition
 *
 * Complete definition for youth education applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YOUTH_EDUCATION_APP_TYPE: AppTypeDefinition = {
  id: 'youth-education',
  name: 'Youth Education',
  category: 'education',
  description: 'Youth Education platform with comprehensive management features',
  icon: 'graduation',

  keywords: [
      "youth education",
      "youth",
      "education",
      "youth software",
      "youth app",
      "youth platform",
      "youth system",
      "youth management",
      "education youth"
  ],

  synonyms: [
      "Youth Education platform",
      "Youth Education software",
      "Youth Education system",
      "youth solution",
      "youth service"
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
      "Build a youth education platform",
      "Create a youth education app",
      "I need a youth education management system",
      "Build a youth education solution",
      "Create a youth education booking system"
  ],
};
