/**
 * User Research App Type Definition
 *
 * Complete definition for user research applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const USER_RESEARCH_APP_TYPE: AppTypeDefinition = {
  id: 'user-research',
  name: 'User Research',
  category: 'services',
  description: 'User Research platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "user research",
      "user",
      "research",
      "user software",
      "user app",
      "user platform",
      "user system",
      "user management",
      "services user"
  ],

  synonyms: [
      "User Research platform",
      "User Research software",
      "User Research system",
      "user solution",
      "user service"
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
      "Build a user research platform",
      "Create a user research app",
      "I need a user research management system",
      "Build a user research solution",
      "Create a user research booking system"
  ],
};
