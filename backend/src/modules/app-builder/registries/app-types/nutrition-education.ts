/**
 * Nutrition Education App Type Definition
 *
 * Complete definition for nutrition education applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const NUTRITION_EDUCATION_APP_TYPE: AppTypeDefinition = {
  id: 'nutrition-education',
  name: 'Nutrition Education',
  category: 'education',
  description: 'Nutrition Education platform with comprehensive management features',
  icon: 'graduation',

  keywords: [
      "nutrition education",
      "nutrition",
      "education",
      "nutrition software",
      "nutrition app",
      "nutrition platform",
      "nutrition system",
      "nutrition management",
      "education nutrition"
  ],

  synonyms: [
      "Nutrition Education platform",
      "Nutrition Education software",
      "Nutrition Education system",
      "nutrition solution",
      "nutrition service"
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
      "Build a nutrition education platform",
      "Create a nutrition education app",
      "I need a nutrition education management system",
      "Build a nutrition education solution",
      "Create a nutrition education booking system"
  ],
};
