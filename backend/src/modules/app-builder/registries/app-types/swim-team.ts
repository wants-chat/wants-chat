/**
 * Swim Team App Type Definition
 *
 * Complete definition for swim team applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SWIM_TEAM_APP_TYPE: AppTypeDefinition = {
  id: 'swim-team',
  name: 'Swim Team',
  category: 'fitness',
  description: 'Swim Team platform with comprehensive management features',
  icon: 'dumbbell',

  keywords: [
      "swim team",
      "swim",
      "team",
      "swim software",
      "swim app",
      "swim platform",
      "swim system",
      "swim management",
      "fitness swim"
  ],

  synonyms: [
      "Swim Team platform",
      "Swim Team software",
      "Swim Team system",
      "swim solution",
      "swim service"
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
          "name": "Owner",
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
          "name": "Trainer",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "Member",
          "level": 10,
          "isDefault": true,
          "accessibleSections": [
              "frontend"
          ],
          "defaultRoute": "/dashboard"
      }
  ],

  defaultFeatures: [
      "user-auth",
      "membership-plans",
      "class-scheduling",
      "check-in",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "workout-tracking",
      "trainer-booking",
      "payments",
      "body-measurements",
      "nutrition-tracking"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'fitness',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'energetic',

  examplePrompts: [
      "Build a swim team platform",
      "Create a swim team app",
      "I need a swim team management system",
      "Build a swim team solution",
      "Create a swim team booking system"
  ],
};
