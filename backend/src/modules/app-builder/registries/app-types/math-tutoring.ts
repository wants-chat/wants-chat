/**
 * Math Tutoring App Type Definition
 *
 * Complete definition for math tutoring applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MATH_TUTORING_APP_TYPE: AppTypeDefinition = {
  id: 'math-tutoring',
  name: 'Math Tutoring',
  category: 'education',
  description: 'Math Tutoring platform with comprehensive management features',
  icon: 'book',

  keywords: [
      "math tutoring",
      "math",
      "tutoring",
      "math software",
      "math app",
      "math platform",
      "math system",
      "math management",
      "education math"
  ],

  synonyms: [
      "Math Tutoring platform",
      "Math Tutoring software",
      "Math Tutoring system",
      "math solution",
      "math service"
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
      "appointments",
      "scheduling",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "messaging",
      "documents"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'education',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
      "Build a math tutoring platform",
      "Create a math tutoring app",
      "I need a math tutoring management system",
      "Build a math tutoring solution",
      "Create a math tutoring booking system"
  ],
};
