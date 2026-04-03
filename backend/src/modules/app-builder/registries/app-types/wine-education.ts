/**
 * Wine Education App Type Definition
 *
 * Complete definition for wine education applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WINE_EDUCATION_APP_TYPE: AppTypeDefinition = {
  id: 'wine-education',
  name: 'Wine Education',
  category: 'education',
  description: 'Wine Education platform with comprehensive management features',
  icon: 'graduation',

  keywords: [
      "wine education",
      "wine",
      "education",
      "wine software",
      "wine app",
      "wine platform",
      "wine system",
      "wine management",
      "education wine"
  ],

  synonyms: [
      "Wine Education platform",
      "Wine Education software",
      "Wine Education system",
      "wine solution",
      "wine service"
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
      "Build a wine education platform",
      "Create a wine education app",
      "I need a wine education management system",
      "Build a wine education solution",
      "Create a wine education booking system"
  ],
};
