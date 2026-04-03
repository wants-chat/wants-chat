/**
 * Accordion Lessons App Type Definition
 *
 * Complete definition for accordion lessons applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ACCORDION_LESSONS_APP_TYPE: AppTypeDefinition = {
  id: 'accordion-lessons',
  name: 'Accordion Lessons',
  category: 'services',
  description: 'Accordion Lessons platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "accordion lessons",
      "accordion",
      "lessons",
      "accordion software",
      "accordion app",
      "accordion platform",
      "accordion system",
      "accordion management",
      "services accordion"
  ],

  synonyms: [
      "Accordion Lessons platform",
      "Accordion Lessons software",
      "Accordion Lessons system",
      "accordion solution",
      "accordion service"
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
      "Build a accordion lessons platform",
      "Create a accordion lessons app",
      "I need a accordion lessons management system",
      "Build a accordion lessons solution",
      "Create a accordion lessons booking system"
  ],
};
