/**
 * Adult Education App Type Definition
 *
 * Complete definition for adult education applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ADULT_EDUCATION_APP_TYPE: AppTypeDefinition = {
  id: 'adult-education',
  name: 'Adult Education',
  category: 'education',
  description: 'Adult Education platform with comprehensive management features',
  icon: 'graduation',

  keywords: [
      "adult education",
      "adult",
      "education",
      "adult software",
      "adult app",
      "adult platform",
      "adult system",
      "adult management",
      "education adult"
  ],

  synonyms: [
      "Adult Education platform",
      "Adult Education software",
      "Adult Education system",
      "adult solution",
      "adult service"
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
      "Build a adult education platform",
      "Create a adult education app",
      "I need a adult education management system",
      "Build a adult education solution",
      "Create a adult education booking system"
  ],
};
