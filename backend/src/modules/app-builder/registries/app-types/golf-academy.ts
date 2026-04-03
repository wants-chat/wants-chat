/**
 * Golf Academy App Type Definition
 *
 * Complete definition for golf academy applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GOLF_ACADEMY_APP_TYPE: AppTypeDefinition = {
  id: 'golf-academy',
  name: 'Golf Academy',
  category: 'education',
  description: 'Golf Academy platform with comprehensive management features',
  icon: 'graduation',

  keywords: [
      "golf academy",
      "golf",
      "academy",
      "golf software",
      "golf app",
      "golf platform",
      "golf system",
      "golf management",
      "education golf"
  ],

  synonyms: [
      "Golf Academy platform",
      "Golf Academy software",
      "Golf Academy system",
      "golf solution",
      "golf service"
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
      "Build a golf academy platform",
      "Create a golf academy app",
      "I need a golf academy management system",
      "Build a golf academy solution",
      "Create a golf academy booking system"
  ],
};
