/**
 * Traffic School App Type Definition
 *
 * Complete definition for traffic school applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRAFFIC_SCHOOL_APP_TYPE: AppTypeDefinition = {
  id: 'traffic-school',
  name: 'Traffic School',
  category: 'education',
  description: 'Traffic School platform with comprehensive management features',
  icon: 'school',

  keywords: [
      "traffic school",
      "traffic",
      "school",
      "traffic software",
      "traffic app",
      "traffic platform",
      "traffic system",
      "traffic management",
      "education traffic"
  ],

  synonyms: [
      "Traffic School platform",
      "Traffic School software",
      "Traffic School system",
      "traffic solution",
      "traffic service"
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
      "Build a traffic school platform",
      "Create a traffic school app",
      "I need a traffic school management system",
      "Build a traffic school solution",
      "Create a traffic school booking system"
  ],
};
