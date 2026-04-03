/**
 * Student Services App Type Definition
 *
 * Complete definition for student services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STUDENT_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'student-services',
  name: 'Student Services',
  category: 'services',
  description: 'Student Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "student services",
      "student",
      "services",
      "student software",
      "student app",
      "student platform",
      "student system",
      "student management",
      "services student"
  ],

  synonyms: [
      "Student Services platform",
      "Student Services software",
      "Student Services system",
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
      "scheduling",
      "invoicing",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "inventory",
      "payments",
      "reviews",
      "clients",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a student services platform",
      "Create a student services app",
      "I need a student services management system",
      "Build a student services solution",
      "Create a student services booking system"
  ],
};
