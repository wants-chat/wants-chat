/**
 * Tutoring Services App Type Definition
 *
 * Complete definition for tutoring services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TUTORING_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'tutoring-services',
  name: 'Tutoring Services',
  category: 'education',
  description: 'Tutoring Services platform with comprehensive management features',
  icon: 'book',

  keywords: [
      "tutoring services",
      "tutoring",
      "services",
      "tutoring software",
      "tutoring app",
      "tutoring platform",
      "tutoring system",
      "tutoring management",
      "education tutoring"
  ],

  synonyms: [
      "Tutoring Services platform",
      "Tutoring Services software",
      "Tutoring Services system",
      "tutoring solution",
      "tutoring service"
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
      "Build a tutoring services platform",
      "Create a tutoring services app",
      "I need a tutoring services management system",
      "Build a tutoring services solution",
      "Create a tutoring services booking system"
  ],
};
