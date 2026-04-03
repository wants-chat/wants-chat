/**
 * Swim Lessons App Type Definition
 *
 * Complete definition for swim lessons applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SWIM_LESSONS_APP_TYPE: AppTypeDefinition = {
  id: 'swim-lessons',
  name: 'Swim Lessons',
  category: 'fitness',
  description: 'Swim Lessons platform with comprehensive management features',
  icon: 'dumbbell',

  keywords: [
      "swim lessons",
      "swim",
      "lessons",
      "swim software",
      "swim app",
      "swim platform",
      "swim system",
      "swim management",
      "fitness swim"
  ],

  synonyms: [
      "Swim Lessons platform",
      "Swim Lessons software",
      "Swim Lessons system",
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
      "Build a swim lessons platform",
      "Create a swim lessons app",
      "I need a swim lessons management system",
      "Build a swim lessons solution",
      "Create a swim lessons booking system"
  ],
};
