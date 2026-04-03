/**
 * Massage School App Type Definition
 *
 * Complete definition for massage school applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MASSAGE_SCHOOL_APP_TYPE: AppTypeDefinition = {
  id: 'massage-school',
  name: 'Massage School',
  category: 'education',
  description: 'Massage School platform with comprehensive management features',
  icon: 'school',

  keywords: [
      "massage school",
      "massage",
      "school",
      "massage software",
      "massage app",
      "massage platform",
      "massage system",
      "massage management",
      "education massage"
  ],

  synonyms: [
      "Massage School platform",
      "Massage School software",
      "Massage School system",
      "massage solution",
      "massage service"
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
      "Build a massage school platform",
      "Create a massage school app",
      "I need a massage school management system",
      "Build a massage school solution",
      "Create a massage school booking system"
  ],
};
