/**
 * Social Work App Type Definition
 *
 * Complete definition for social work applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SOCIAL_WORK_APP_TYPE: AppTypeDefinition = {
  id: 'social-work',
  name: 'Social Work',
  category: 'services',
  description: 'Social Work platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "social work",
      "social",
      "work",
      "social software",
      "social app",
      "social platform",
      "social system",
      "social management",
      "services social"
  ],

  synonyms: [
      "Social Work platform",
      "Social Work software",
      "Social Work system",
      "social solution",
      "social service"
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
      "Build a social work platform",
      "Create a social work app",
      "I need a social work management system",
      "Build a social work solution",
      "Create a social work booking system"
  ],
};
