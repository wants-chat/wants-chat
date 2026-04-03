/**
 * Virtual School App Type Definition
 *
 * Complete definition for virtual school applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VIRTUAL_SCHOOL_APP_TYPE: AppTypeDefinition = {
  id: 'virtual-school',
  name: 'Virtual School',
  category: 'education',
  description: 'Virtual School platform with comprehensive management features',
  icon: 'school',

  keywords: [
      "virtual school",
      "virtual",
      "school",
      "virtual software",
      "virtual app",
      "virtual platform",
      "virtual system",
      "virtual management",
      "education virtual"
  ],

  synonyms: [
      "Virtual School platform",
      "Virtual School software",
      "Virtual School system",
      "virtual solution",
      "virtual service"
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
      "Build a virtual school platform",
      "Create a virtual school app",
      "I need a virtual school management system",
      "Build a virtual school solution",
      "Create a virtual school booking system"
  ],
};
