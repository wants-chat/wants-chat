/**
 * Outdoor Education App Type Definition
 *
 * Complete definition for outdoor education applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const OUTDOOR_EDUCATION_APP_TYPE: AppTypeDefinition = {
  id: 'outdoor-education',
  name: 'Outdoor Education',
  category: 'education',
  description: 'Outdoor Education platform with comprehensive management features',
  icon: 'graduation',

  keywords: [
      "outdoor education",
      "outdoor",
      "education",
      "outdoor software",
      "outdoor app",
      "outdoor platform",
      "outdoor system",
      "outdoor management",
      "education outdoor"
  ],

  synonyms: [
      "Outdoor Education platform",
      "Outdoor Education software",
      "Outdoor Education system",
      "outdoor solution",
      "outdoor service"
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
      "course-management",
      "student-records",
      "assignments",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "grading",
      "attendance",
      "lms",
      "certificates",
      "parent-portal"
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
      "Build a outdoor education platform",
      "Create a outdoor education app",
      "I need a outdoor education management system",
      "Build a outdoor education solution",
      "Create a outdoor education booking system"
  ],
};
