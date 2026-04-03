/**
 * Charter School App Type Definition
 *
 * Complete definition for charter school applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CHARTER_SCHOOL_APP_TYPE: AppTypeDefinition = {
  id: 'charter-school',
  name: 'Charter School',
  category: 'education',
  description: 'Charter School platform with comprehensive management features',
  icon: 'school',

  keywords: [
      "charter school",
      "charter",
      "school",
      "charter software",
      "charter app",
      "charter platform",
      "charter system",
      "charter management",
      "education charter"
  ],

  synonyms: [
      "Charter School platform",
      "Charter School software",
      "Charter School system",
      "charter solution",
      "charter service"
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
      "Build a charter school platform",
      "Create a charter school app",
      "I need a charter school management system",
      "Build a charter school solution",
      "Create a charter school booking system"
  ],
};
