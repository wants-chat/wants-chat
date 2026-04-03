/**
 * Sleep Study App Type Definition
 *
 * Complete definition for sleep study applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SLEEP_STUDY_APP_TYPE: AppTypeDefinition = {
  id: 'sleep-study',
  name: 'Sleep Study',
  category: 'services',
  description: 'Sleep Study platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "sleep study",
      "sleep",
      "study",
      "sleep software",
      "sleep app",
      "sleep platform",
      "sleep system",
      "sleep management",
      "services sleep"
  ],

  synonyms: [
      "Sleep Study platform",
      "Sleep Study software",
      "Sleep Study system",
      "sleep solution",
      "sleep service"
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
      "Build a sleep study platform",
      "Create a sleep study app",
      "I need a sleep study management system",
      "Build a sleep study solution",
      "Create a sleep study booking system"
  ],
};
