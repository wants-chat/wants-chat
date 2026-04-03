/**
 * Football Academy App Type Definition
 *
 * Complete definition for football academy applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FOOTBALL_ACADEMY_APP_TYPE: AppTypeDefinition = {
  id: 'football-academy',
  name: 'Football Academy',
  category: 'education',
  description: 'Football Academy platform with comprehensive management features',
  icon: 'graduation',

  keywords: [
      "football academy",
      "football",
      "academy",
      "football software",
      "football app",
      "football platform",
      "football system",
      "football management",
      "education football"
  ],

  synonyms: [
      "Football Academy platform",
      "Football Academy software",
      "Football Academy system",
      "football solution",
      "football service"
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
      "Build a football academy platform",
      "Create a football academy app",
      "I need a football academy management system",
      "Build a football academy solution",
      "Create a football academy booking system"
  ],
};
