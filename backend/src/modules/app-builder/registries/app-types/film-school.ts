/**
 * Film School App Type Definition
 *
 * Complete definition for film school applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FILM_SCHOOL_APP_TYPE: AppTypeDefinition = {
  id: 'film-school',
  name: 'Film School',
  category: 'education',
  description: 'Film School platform with comprehensive management features',
  icon: 'school',

  keywords: [
      "film school",
      "film",
      "school",
      "film software",
      "film app",
      "film platform",
      "film system",
      "film management",
      "education film"
  ],

  synonyms: [
      "Film School platform",
      "Film School software",
      "Film School system",
      "film solution",
      "film service"
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
      "student-records",
      "attendance",
      "class-roster",
      "calendar",
      "notifications"
  ],

  optionalFeatures: [
      "grading",
      "assignments",
      "parent-portal",
      "transcripts",
      "enrollment"
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
      "Build a film school platform",
      "Create a film school app",
      "I need a film school management system",
      "Build a film school solution",
      "Create a film school booking system"
  ],
};
