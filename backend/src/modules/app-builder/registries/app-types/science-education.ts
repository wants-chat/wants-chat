/**
 * Science Education App Type Definition
 *
 * Complete definition for science education applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SCIENCE_EDUCATION_APP_TYPE: AppTypeDefinition = {
  id: 'science-education',
  name: 'Science Education',
  category: 'education',
  description: 'Science Education platform with comprehensive management features',
  icon: 'graduation',

  keywords: [
      "science education",
      "science",
      "education",
      "science software",
      "science app",
      "science platform",
      "science system",
      "science management",
      "education science"
  ],

  synonyms: [
      "Science Education platform",
      "Science Education software",
      "Science Education system",
      "science solution",
      "science service"
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
      "Build a science education platform",
      "Create a science education app",
      "I need a science education management system",
      "Build a science education solution",
      "Create a science education booking system"
  ],
};
