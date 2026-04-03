/**
 * Assessment Center App Type Definition
 *
 * Complete definition for assessment center applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ASSESSMENT_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'assessment-center',
  name: 'Assessment Center',
  category: 'services',
  description: 'Assessment Center platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "assessment center",
      "assessment",
      "center",
      "assessment software",
      "assessment app",
      "assessment platform",
      "assessment system",
      "assessment management",
      "services assessment"
  ],

  synonyms: [
      "Assessment Center platform",
      "Assessment Center software",
      "Assessment Center system",
      "assessment solution",
      "assessment service"
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
      "Build a assessment center platform",
      "Create a assessment center app",
      "I need a assessment center management system",
      "Build a assessment center solution",
      "Create a assessment center booking system"
  ],
};
