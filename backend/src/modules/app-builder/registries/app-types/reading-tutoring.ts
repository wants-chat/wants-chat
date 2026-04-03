/**
 * Reading Tutoring App Type Definition
 *
 * Complete definition for reading tutoring applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const READING_TUTORING_APP_TYPE: AppTypeDefinition = {
  id: 'reading-tutoring',
  name: 'Reading Tutoring',
  category: 'education',
  description: 'Reading Tutoring platform with comprehensive management features',
  icon: 'book',

  keywords: [
      "reading tutoring",
      "reading",
      "tutoring",
      "reading software",
      "reading app",
      "reading platform",
      "reading system",
      "reading management",
      "education reading"
  ],

  synonyms: [
      "Reading Tutoring platform",
      "Reading Tutoring software",
      "Reading Tutoring system",
      "reading solution",
      "reading service"
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
      "Build a reading tutoring platform",
      "Create a reading tutoring app",
      "I need a reading tutoring management system",
      "Build a reading tutoring solution",
      "Create a reading tutoring booking system"
  ],
};
