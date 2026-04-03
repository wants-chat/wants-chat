/**
 * Prep School App Type Definition
 *
 * Complete definition for prep school applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PREP_SCHOOL_APP_TYPE: AppTypeDefinition = {
  id: 'prep-school',
  name: 'Prep School',
  category: 'education',
  description: 'Prep School platform with comprehensive management features',
  icon: 'school',

  keywords: [
      "prep school",
      "prep",
      "school",
      "prep software",
      "prep app",
      "prep platform",
      "prep system",
      "prep management",
      "education prep"
  ],

  synonyms: [
      "Prep School platform",
      "Prep School software",
      "Prep School system",
      "prep solution",
      "prep service"
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
      "Build a prep school platform",
      "Create a prep school app",
      "I need a prep school management system",
      "Build a prep school solution",
      "Create a prep school booking system"
  ],
};
