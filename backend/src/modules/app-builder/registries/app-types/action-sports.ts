/**
 * Action Sports App Type Definition
 *
 * Complete definition for action sports applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ACTION_SPORTS_APP_TYPE: AppTypeDefinition = {
  id: 'action-sports',
  name: 'Action Sports',
  category: 'fitness',
  description: 'Action Sports platform with comprehensive management features',
  icon: 'dumbbell',

  keywords: [
      "action sports",
      "action",
      "sports",
      "action software",
      "action app",
      "action platform",
      "action system",
      "action management",
      "fitness action"
  ],

  synonyms: [
      "Action Sports platform",
      "Action Sports software",
      "Action Sports system",
      "action solution",
      "action service"
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
      "Build a action sports platform",
      "Create a action sports app",
      "I need a action sports management system",
      "Build a action sports solution",
      "Create a action sports booking system"
  ],
};
