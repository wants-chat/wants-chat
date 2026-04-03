/**
 * Service Learning App Type Definition
 *
 * Complete definition for service learning applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SERVICE_LEARNING_APP_TYPE: AppTypeDefinition = {
  id: 'service-learning',
  name: 'Service Learning',
  category: 'education',
  description: 'Service Learning platform with comprehensive management features',
  icon: 'graduation',

  keywords: [
      "service learning",
      "service",
      "learning",
      "service software",
      "service app",
      "service platform",
      "service system",
      "service management",
      "education service"
  ],

  synonyms: [
      "Service Learning platform",
      "Service Learning software",
      "Service Learning system",
      "service solution",
      "service service"
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
      "Build a service learning platform",
      "Create a service learning app",
      "I need a service learning management system",
      "Build a service learning solution",
      "Create a service learning booking system"
  ],
};
