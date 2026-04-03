/**
 * Modeling School App Type Definition
 *
 * Complete definition for modeling school applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MODELING_SCHOOL_APP_TYPE: AppTypeDefinition = {
  id: 'modeling-school',
  name: 'Modeling School',
  category: 'education',
  description: 'Modeling School platform with comprehensive management features',
  icon: 'school',

  keywords: [
      "modeling school",
      "modeling",
      "school",
      "modeling software",
      "modeling app",
      "modeling platform",
      "modeling system",
      "modeling management",
      "education modeling"
  ],

  synonyms: [
      "Modeling School platform",
      "Modeling School software",
      "Modeling School system",
      "modeling solution",
      "modeling service"
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
      "Build a modeling school platform",
      "Create a modeling school app",
      "I need a modeling school management system",
      "Build a modeling school solution",
      "Create a modeling school booking system"
  ],
};
