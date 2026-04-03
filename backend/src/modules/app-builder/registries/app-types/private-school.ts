/**
 * Private School App Type Definition
 *
 * Complete definition for private school applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PRIVATE_SCHOOL_APP_TYPE: AppTypeDefinition = {
  id: 'private-school',
  name: 'Private School',
  category: 'education',
  description: 'Private School platform with comprehensive management features',
  icon: 'school',

  keywords: [
      "private school",
      "private",
      "school",
      "private software",
      "private app",
      "private platform",
      "private system",
      "private management",
      "education private"
  ],

  synonyms: [
      "Private School platform",
      "Private School software",
      "Private School system",
      "private solution",
      "private service"
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
      "Build a private school platform",
      "Create a private school app",
      "I need a private school management system",
      "Build a private school solution",
      "Create a private school booking system"
  ],
};
