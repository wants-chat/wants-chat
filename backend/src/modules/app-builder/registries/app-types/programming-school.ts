/**
 * Programming School App Type Definition
 *
 * Complete definition for programming school applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PROGRAMMING_SCHOOL_APP_TYPE: AppTypeDefinition = {
  id: 'programming-school',
  name: 'Programming School',
  category: 'education',
  description: 'Programming School platform with comprehensive management features',
  icon: 'school',

  keywords: [
      "programming school",
      "programming",
      "school",
      "programming software",
      "programming app",
      "programming platform",
      "programming system",
      "programming management",
      "education programming"
  ],

  synonyms: [
      "Programming School platform",
      "Programming School software",
      "Programming School system",
      "programming solution",
      "programming service"
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
      "Build a programming school platform",
      "Create a programming school app",
      "I need a programming school management system",
      "Build a programming school solution",
      "Create a programming school booking system"
  ],
};
