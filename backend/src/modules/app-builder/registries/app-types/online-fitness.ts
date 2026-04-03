/**
 * Online Fitness App Type Definition
 *
 * Complete definition for online fitness applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ONLINE_FITNESS_APP_TYPE: AppTypeDefinition = {
  id: 'online-fitness',
  name: 'Online Fitness',
  category: 'fitness',
  description: 'Online Fitness platform with comprehensive management features',
  icon: 'dumbbell',

  keywords: [
      "online fitness",
      "online",
      "fitness",
      "online software",
      "online app",
      "online platform",
      "online system",
      "online management",
      "fitness online"
  ],

  synonyms: [
      "Online Fitness platform",
      "Online Fitness software",
      "Online Fitness system",
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
      "Build a online fitness platform",
      "Create a online fitness app",
      "I need a online fitness management system",
      "Build a online fitness solution",
      "Create a online fitness booking system"
  ],
};
