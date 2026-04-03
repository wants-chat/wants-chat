/**
 * Senior Community App Type Definition
 *
 * Complete definition for senior community applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SENIOR_COMMUNITY_APP_TYPE: AppTypeDefinition = {
  id: 'senior-community',
  name: 'Senior Community',
  category: 'community',
  description: 'Senior Community platform with comprehensive management features',
  icon: 'users',

  keywords: [
      "senior community",
      "senior",
      "community",
      "senior software",
      "senior app",
      "senior platform",
      "senior system",
      "senior management",
      "community senior"
  ],

  synonyms: [
      "Senior Community platform",
      "Senior Community software",
      "Senior Community system",
      "senior solution",
      "senior service"
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
      "announcements",
      "calendar",
      "messaging",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "blog",
      "gallery",
      "feedback",
      "documents"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'medium',
  industry: 'community',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
      "Build a senior community platform",
      "Create a senior community app",
      "I need a senior community management system",
      "Build a senior community solution",
      "Create a senior community booking system"
  ],
};
