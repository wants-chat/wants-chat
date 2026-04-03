/**
 * Abacus Tutoring App Type Definition
 *
 * Complete definition for abacus tutoring applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ABACUS_TUTORING_APP_TYPE: AppTypeDefinition = {
  id: 'abacus-tutoring',
  name: 'Abacus Tutoring',
  category: 'education',
  description: 'Abacus Tutoring platform with comprehensive management features',
  icon: 'book',

  keywords: [
      "abacus tutoring",
      "abacus",
      "tutoring",
      "abacus software",
      "abacus app",
      "abacus platform",
      "abacus system",
      "abacus management",
      "education abacus"
  ],

  synonyms: [
      "Abacus Tutoring platform",
      "Abacus Tutoring software",
      "Abacus Tutoring system",
      "abacus solution",
      "abacus service"
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
      "Build a abacus tutoring platform",
      "Create a abacus tutoring app",
      "I need a abacus tutoring management system",
      "Build a abacus tutoring solution",
      "Create a abacus tutoring booking system"
  ],
};
