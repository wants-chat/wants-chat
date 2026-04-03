/**
 * Ski Lessons App Type Definition
 *
 * Complete definition for ski lessons applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SKI_LESSONS_APP_TYPE: AppTypeDefinition = {
  id: 'ski-lessons',
  name: 'Ski Lessons',
  category: 'services',
  description: 'Ski Lessons platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "ski lessons",
      "ski",
      "lessons",
      "ski software",
      "ski app",
      "ski platform",
      "ski system",
      "ski management",
      "services ski"
  ],

  synonyms: [
      "Ski Lessons platform",
      "Ski Lessons software",
      "Ski Lessons system",
      "ski solution",
      "ski service"
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
      "Build a ski lessons platform",
      "Create a ski lessons app",
      "I need a ski lessons management system",
      "Build a ski lessons solution",
      "Create a ski lessons booking system"
  ],
};
