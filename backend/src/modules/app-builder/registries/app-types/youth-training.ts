/**
 * Youth Training App Type Definition
 *
 * Complete definition for youth training applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YOUTH_TRAINING_APP_TYPE: AppTypeDefinition = {
  id: 'youth-training',
  name: 'Youth Training',
  category: 'education',
  description: 'Youth Training platform with comprehensive management features',
  icon: 'certificate',

  keywords: [
      "youth training",
      "youth",
      "training",
      "youth software",
      "youth app",
      "youth platform",
      "youth system",
      "youth management",
      "education youth"
  ],

  synonyms: [
      "Youth Training platform",
      "Youth Training software",
      "Youth Training system",
      "youth solution",
      "youth service"
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
      "enrollment",
      "calendar",
      "certificates",
      "notifications"
  ],

  optionalFeatures: [
      "lms",
      "assignments",
      "payments",
      "attendance",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'education',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a youth training platform",
      "Create a youth training app",
      "I need a youth training management system",
      "Build a youth training solution",
      "Create a youth training booking system"
  ],
};
