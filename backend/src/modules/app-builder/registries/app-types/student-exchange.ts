/**
 * Student Exchange App Type Definition
 *
 * Complete definition for student exchange applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STUDENT_EXCHANGE_APP_TYPE: AppTypeDefinition = {
  id: 'student-exchange',
  name: 'Student Exchange',
  category: 'services',
  description: 'Student Exchange platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "student exchange",
      "student",
      "exchange",
      "student software",
      "student app",
      "student platform",
      "student system",
      "student management",
      "services student"
  ],

  synonyms: [
      "Student Exchange platform",
      "Student Exchange software",
      "Student Exchange system",
      "student solution",
      "student service"
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
          "name": "Staff",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "User",
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
      "appointments",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a student exchange platform",
      "Create a student exchange app",
      "I need a student exchange management system",
      "Build a student exchange solution",
      "Create a student exchange booking system"
  ],
};
