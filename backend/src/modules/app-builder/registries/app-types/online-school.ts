/**
 * Online School App Type Definition
 *
 * Complete definition for online school applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ONLINE_SCHOOL_APP_TYPE: AppTypeDefinition = {
  id: 'online-school',
  name: 'Online School',
  category: 'education',
  description: 'Online School platform with comprehensive management features',
  icon: 'school',

  keywords: [
      "online school",
      "online",
      "school",
      "online software",
      "online app",
      "online platform",
      "online system",
      "online management",
      "education online"
  ],

  synonyms: [
      "Online School platform",
      "Online School software",
      "Online School system",
      "online solution",
      "online service"
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
      "Build a online school platform",
      "Create a online school app",
      "I need a online school management system",
      "Build a online school solution",
      "Create a online school booking system"
  ],
};
