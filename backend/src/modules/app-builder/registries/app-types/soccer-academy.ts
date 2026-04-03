/**
 * Soccer Academy App Type Definition
 *
 * Complete definition for soccer academy applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SOCCER_ACADEMY_APP_TYPE: AppTypeDefinition = {
  id: 'soccer-academy',
  name: 'Soccer Academy',
  category: 'education',
  description: 'Soccer Academy platform with comprehensive management features',
  icon: 'graduation',

  keywords: [
      "soccer academy",
      "soccer",
      "academy",
      "soccer software",
      "soccer app",
      "soccer platform",
      "soccer system",
      "soccer management",
      "education soccer"
  ],

  synonyms: [
      "Soccer Academy platform",
      "Soccer Academy software",
      "Soccer Academy system",
      "soccer solution",
      "soccer service"
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
      "Build a soccer academy platform",
      "Create a soccer academy app",
      "I need a soccer academy management system",
      "Build a soccer academy solution",
      "Create a soccer academy booking system"
  ],
};
