/**
 * Middle School App Type Definition
 *
 * Complete definition for middle school applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MIDDLE_SCHOOL_APP_TYPE: AppTypeDefinition = {
  id: 'middle-school',
  name: 'Middle School',
  category: 'education',
  description: 'Middle School platform with comprehensive management features',
  icon: 'school',

  keywords: [
      "middle school",
      "middle",
      "school",
      "middle software",
      "middle app",
      "middle platform",
      "middle system",
      "middle management",
      "education middle"
  ],

  synonyms: [
      "Middle School platform",
      "Middle School software",
      "Middle School system",
      "middle solution",
      "middle service"
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
      "Build a middle school platform",
      "Create a middle school app",
      "I need a middle school management system",
      "Build a middle school solution",
      "Create a middle school booking system"
  ],
};
