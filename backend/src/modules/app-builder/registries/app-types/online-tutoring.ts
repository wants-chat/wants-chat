/**
 * Online Tutoring App Type Definition
 *
 * Complete definition for online tutoring applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ONLINE_TUTORING_APP_TYPE: AppTypeDefinition = {
  id: 'online-tutoring',
  name: 'Online Tutoring',
  category: 'education',
  description: 'Online Tutoring platform with comprehensive management features',
  icon: 'book',

  keywords: [
      "online tutoring",
      "online",
      "tutoring",
      "online software",
      "online app",
      "online platform",
      "online system",
      "online management",
      "education online"
  ],

  synonyms: [
      "Online Tutoring platform",
      "Online Tutoring software",
      "Online Tutoring system",
      "online solution",
      "online service"
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
      "Build a online tutoring platform",
      "Create a online tutoring app",
      "I need a online tutoring management system",
      "Build a online tutoring solution",
      "Create a online tutoring booking system"
  ],
};
