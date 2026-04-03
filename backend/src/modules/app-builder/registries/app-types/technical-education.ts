/**
 * Technical Education App Type Definition
 *
 * Complete definition for technical education applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TECHNICAL_EDUCATION_APP_TYPE: AppTypeDefinition = {
  id: 'technical-education',
  name: 'Technical Education',
  category: 'education',
  description: 'Technical Education platform with comprehensive management features',
  icon: 'graduation',

  keywords: [
      "technical education",
      "technical",
      "education",
      "technical software",
      "technical app",
      "technical platform",
      "technical system",
      "technical management",
      "education technical"
  ],

  synonyms: [
      "Technical Education platform",
      "Technical Education software",
      "Technical Education system",
      "technical solution",
      "technical service"
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
      "Build a technical education platform",
      "Create a technical education app",
      "I need a technical education management system",
      "Build a technical education solution",
      "Create a technical education booking system"
  ],
};
