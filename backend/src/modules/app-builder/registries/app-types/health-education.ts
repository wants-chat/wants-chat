/**
 * Health Education App Type Definition
 *
 * Complete definition for health education applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HEALTH_EDUCATION_APP_TYPE: AppTypeDefinition = {
  id: 'health-education',
  name: 'Health Education',
  category: 'education',
  description: 'Health Education platform with comprehensive management features',
  icon: 'graduation',

  keywords: [
      "health education",
      "health",
      "education",
      "health software",
      "health app",
      "health platform",
      "health system",
      "health management",
      "education health"
  ],

  synonyms: [
      "Health Education platform",
      "Health Education software",
      "Health Education system",
      "health solution",
      "health service"
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
      "Build a health education platform",
      "Create a health education app",
      "I need a health education management system",
      "Build a health education solution",
      "Create a health education booking system"
  ],
};
