/**
 * Kid Fitness App Type Definition
 *
 * Complete definition for kid fitness applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const KID_FITNESS_APP_TYPE: AppTypeDefinition = {
  id: 'kid-fitness',
  name: 'Kid Fitness',
  category: 'fitness',
  description: 'Kid Fitness platform with comprehensive management features',
  icon: 'dumbbell',

  keywords: [
      "kid fitness",
      "kid",
      "fitness",
      "kid software",
      "kid app",
      "kid platform",
      "kid system",
      "kid management",
      "fitness kid"
  ],

  synonyms: [
      "Kid Fitness platform",
      "Kid Fitness software",
      "Kid Fitness system",
      "kid solution",
      "kid service"
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
      "Build a kid fitness platform",
      "Create a kid fitness app",
      "I need a kid fitness management system",
      "Build a kid fitness solution",
      "Create a kid fitness booking system"
  ],
};
