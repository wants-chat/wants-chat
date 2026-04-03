/**
 * School Photography App Type Definition
 *
 * Complete definition for school photography applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SCHOOL_PHOTOGRAPHY_APP_TYPE: AppTypeDefinition = {
  id: 'school-photography',
  name: 'School Photography',
  category: 'education',
  description: 'School Photography platform with comprehensive management features',
  icon: 'school',

  keywords: [
      "school photography",
      "school",
      "photography",
      "school software",
      "school app",
      "school platform",
      "school system",
      "school management",
      "education school"
  ],

  synonyms: [
      "School Photography platform",
      "School Photography software",
      "School Photography system",
      "school solution",
      "school service"
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
      "student-records",
      "attendance",
      "class-roster",
      "calendar",
      "notifications"
  ],

  optionalFeatures: [
      "grading",
      "assignments",
      "parent-portal",
      "transcripts",
      "enrollment"
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
      "Build a school photography platform",
      "Create a school photography app",
      "I need a school photography management system",
      "Build a school photography solution",
      "Create a school photography booking system"
  ],
};
