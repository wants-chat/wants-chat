/**
 * Obstacle Course App Type Definition
 *
 * Complete definition for obstacle course applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const OBSTACLE_COURSE_APP_TYPE: AppTypeDefinition = {
  id: 'obstacle-course',
  name: 'Obstacle Course',
  category: 'education',
  description: 'Obstacle Course platform with comprehensive management features',
  icon: 'graduation',

  keywords: [
      "obstacle course",
      "obstacle",
      "course",
      "obstacle software",
      "obstacle app",
      "obstacle platform",
      "obstacle system",
      "obstacle management",
      "education obstacle"
  ],

  synonyms: [
      "Obstacle Course platform",
      "Obstacle Course software",
      "Obstacle Course system",
      "obstacle solution",
      "obstacle service"
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
      "Build a obstacle course platform",
      "Create a obstacle course app",
      "I need a obstacle course management system",
      "Build a obstacle course solution",
      "Create a obstacle course booking system"
  ],
};
