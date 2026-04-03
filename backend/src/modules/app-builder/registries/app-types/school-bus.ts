/**
 * School Bus App Type Definition
 *
 * Complete definition for school bus applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SCHOOL_BUS_APP_TYPE: AppTypeDefinition = {
  id: 'school-bus',
  name: 'School Bus',
  category: 'education',
  description: 'School Bus platform with comprehensive management features',
  icon: 'school',

  keywords: [
      "school bus",
      "school",
      "bus",
      "school software",
      "school app",
      "school platform",
      "school system",
      "school management",
      "education school"
  ],

  synonyms: [
      "School Bus platform",
      "School Bus software",
      "School Bus system",
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
      "Build a school bus platform",
      "Create a school bus app",
      "I need a school bus management system",
      "Build a school bus solution",
      "Create a school bus booking system"
  ],
};
