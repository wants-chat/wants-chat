/**
 * Tennis Academy App Type Definition
 *
 * Complete definition for tennis academy applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TENNIS_ACADEMY_APP_TYPE: AppTypeDefinition = {
  id: 'tennis-academy',
  name: 'Tennis Academy',
  category: 'education',
  description: 'Tennis Academy platform with comprehensive management features',
  icon: 'graduation',

  keywords: [
      "tennis academy",
      "tennis",
      "academy",
      "tennis software",
      "tennis app",
      "tennis platform",
      "tennis system",
      "tennis management",
      "education tennis"
  ],

  synonyms: [
      "Tennis Academy platform",
      "Tennis Academy software",
      "Tennis Academy system",
      "tennis solution",
      "tennis service"
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
      "Build a tennis academy platform",
      "Create a tennis academy app",
      "I need a tennis academy management system",
      "Build a tennis academy solution",
      "Create a tennis academy booking system"
  ],
};
