/**
 * Team Building App Type Definition
 *
 * Complete definition for team building applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TEAM_BUILDING_APP_TYPE: AppTypeDefinition = {
  id: 'team-building',
  name: 'Team Building',
  category: 'services',
  description: 'Team Building platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "team building",
      "team",
      "building",
      "team software",
      "team app",
      "team platform",
      "team system",
      "team management",
      "services team"
  ],

  synonyms: [
      "Team Building platform",
      "Team Building software",
      "Team Building system",
      "team solution",
      "team service"
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
      "Build a team building platform",
      "Create a team building app",
      "I need a team building management system",
      "Build a team building solution",
      "Create a team building booking system"
  ],
};
