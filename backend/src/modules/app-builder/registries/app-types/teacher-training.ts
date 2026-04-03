/**
 * Teacher Training App Type Definition
 *
 * Complete definition for teacher training applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TEACHER_TRAINING_APP_TYPE: AppTypeDefinition = {
  id: 'teacher-training',
  name: 'Teacher Training',
  category: 'education',
  description: 'Teacher Training platform with comprehensive management features',
  icon: 'certificate',

  keywords: [
      "teacher training",
      "teacher",
      "training",
      "teacher software",
      "teacher app",
      "teacher platform",
      "teacher system",
      "teacher management",
      "education teacher"
  ],

  synonyms: [
      "Teacher Training platform",
      "Teacher Training software",
      "Teacher Training system",
      "teacher solution",
      "teacher service"
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
      "Build a teacher training platform",
      "Create a teacher training app",
      "I need a teacher training management system",
      "Build a teacher training solution",
      "Create a teacher training booking system"
  ],
};
