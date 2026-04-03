/**
 * Online Learning App Type Definition
 *
 * Complete definition for online learning applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ONLINE_LEARNING_APP_TYPE: AppTypeDefinition = {
  id: 'online-learning',
  name: 'Online Learning',
  category: 'education',
  description: 'Online Learning platform with comprehensive management features',
  icon: 'graduation',

  keywords: [
      "online learning",
      "online",
      "learning",
      "online software",
      "online app",
      "online platform",
      "online system",
      "online management",
      "education online"
  ],

  synonyms: [
      "Online Learning platform",
      "Online Learning software",
      "Online Learning system",
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
      "course-management",
      "student-records",
      "assignments",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "grading",
      "attendance",
      "lms",
      "certificates",
      "parent-portal"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'education',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'clean',

  examplePrompts: [
      "Build a online learning platform",
      "Create a online learning app",
      "I need a online learning management system",
      "Build a online learning solution",
      "Create a online learning booking system"
  ],
};
