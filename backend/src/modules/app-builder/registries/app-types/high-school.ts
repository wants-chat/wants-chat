/**
 * High School App Type Definition
 *
 * Complete definition for high school applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HIGH_SCHOOL_APP_TYPE: AppTypeDefinition = {
  id: 'high-school',
  name: 'High School',
  category: 'education',
  description: 'High School platform with comprehensive management features',
  icon: 'school',

  keywords: [
      "high school",
      "high",
      "school",
      "high software",
      "high app",
      "high platform",
      "high system",
      "high management",
      "education high"
  ],

  synonyms: [
      "High School platform",
      "High School software",
      "High School system",
      "high solution",
      "high service"
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
      "Build a high school platform",
      "Create a high school app",
      "I need a high school management system",
      "Build a high school solution",
      "Create a high school booking system"
  ],
};
