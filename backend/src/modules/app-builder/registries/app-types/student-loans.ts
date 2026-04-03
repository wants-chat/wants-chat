/**
 * Student Loans App Type Definition
 *
 * Complete definition for student loans applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STUDENT_LOANS_APP_TYPE: AppTypeDefinition = {
  id: 'student-loans',
  name: 'Student Loans',
  category: 'services',
  description: 'Student Loans platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "student loans",
      "student",
      "loans",
      "student software",
      "student app",
      "student platform",
      "student system",
      "student management",
      "services student"
  ],

  synonyms: [
      "Student Loans platform",
      "Student Loans software",
      "Student Loans system",
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
      "Build a student loans platform",
      "Create a student loans app",
      "I need a student loans management system",
      "Build a student loans solution",
      "Create a student loans booking system"
  ],
};
