/**
 * Riding School App Type Definition
 *
 * Complete definition for riding school applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RIDING_SCHOOL_APP_TYPE: AppTypeDefinition = {
  id: 'riding-school',
  name: 'Riding School',
  category: 'education',
  description: 'Riding School platform with comprehensive management features',
  icon: 'school',

  keywords: [
      "riding school",
      "riding",
      "school",
      "riding software",
      "riding app",
      "riding platform",
      "riding system",
      "riding management",
      "education riding"
  ],

  synonyms: [
      "Riding School platform",
      "Riding School software",
      "Riding School system",
      "riding solution",
      "riding service"
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
      "Build a riding school platform",
      "Create a riding school app",
      "I need a riding school management system",
      "Build a riding school solution",
      "Create a riding school booking system"
  ],
};
