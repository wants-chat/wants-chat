/**
 * Physics Tutoring App Type Definition
 *
 * Complete definition for physics tutoring applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PHYSICS_TUTORING_APP_TYPE: AppTypeDefinition = {
  id: 'physics-tutoring',
  name: 'Physics Tutoring',
  category: 'education',
  description: 'Physics Tutoring platform with comprehensive management features',
  icon: 'book',

  keywords: [
      "physics tutoring",
      "physics",
      "tutoring",
      "physics software",
      "physics app",
      "physics platform",
      "physics system",
      "physics management",
      "education physics"
  ],

  synonyms: [
      "Physics Tutoring platform",
      "Physics Tutoring software",
      "Physics Tutoring system",
      "physics solution",
      "physics service"
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
      "Build a physics tutoring platform",
      "Create a physics tutoring app",
      "I need a physics tutoring management system",
      "Build a physics tutoring solution",
      "Create a physics tutoring booking system"
  ],
};
