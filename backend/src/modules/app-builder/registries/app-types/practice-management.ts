/**
 * Practice Management App Type Definition
 *
 * Complete definition for practice management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PRACTICE_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'practice-management',
  name: 'Practice Management',
  category: 'services',
  description: 'Practice Management platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "practice management",
      "practice",
      "management",
      "practice software",
      "practice app",
      "practice platform",
      "practice system",
      "services practice"
  ],

  synonyms: [
      "Practice Management platform",
      "Practice Management software",
      "Practice Management system",
      "practice solution",
      "practice service"
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
      "Build a practice management platform",
      "Create a practice management app",
      "I need a practice management management system",
      "Build a practice management solution",
      "Create a practice management booking system"
  ],
};
