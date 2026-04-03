/**
 * Nursing Education App Type Definition
 *
 * Complete definition for nursing education applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const NURSING_EDUCATION_APP_TYPE: AppTypeDefinition = {
  id: 'nursing-education',
  name: 'Nursing Education',
  category: 'education',
  description: 'Nursing Education platform with comprehensive management features',
  icon: 'graduation',

  keywords: [
      "nursing education",
      "nursing",
      "education",
      "nursing software",
      "nursing app",
      "nursing platform",
      "nursing system",
      "nursing management",
      "education nursing"
  ],

  synonyms: [
      "Nursing Education platform",
      "Nursing Education software",
      "Nursing Education system",
      "nursing solution",
      "nursing service"
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
      "Build a nursing education platform",
      "Create a nursing education app",
      "I need a nursing education management system",
      "Build a nursing education solution",
      "Create a nursing education booking system"
  ],
};
