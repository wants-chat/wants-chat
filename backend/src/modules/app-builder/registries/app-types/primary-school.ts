/**
 * Primary School App Type Definition
 *
 * Complete definition for primary school applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PRIMARY_SCHOOL_APP_TYPE: AppTypeDefinition = {
  id: 'primary-school',
  name: 'Primary School',
  category: 'education',
  description: 'Primary School platform with comprehensive management features',
  icon: 'school',

  keywords: [
      "primary school",
      "primary",
      "school",
      "primary software",
      "primary app",
      "primary platform",
      "primary system",
      "primary management",
      "education primary"
  ],

  synonyms: [
      "Primary School platform",
      "Primary School software",
      "Primary School system",
      "primary solution",
      "primary service"
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
      "Build a primary school platform",
      "Create a primary school app",
      "I need a primary school management system",
      "Build a primary school solution",
      "Create a primary school booking system"
  ],
};
