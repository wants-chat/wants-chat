/**
 * Fitness Boot Camp App Type Definition
 *
 * Complete definition for fitness boot camp applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FITNESS_BOOT_CAMP_APP_TYPE: AppTypeDefinition = {
  id: 'fitness-boot-camp',
  name: 'Fitness Boot Camp',
  category: 'fitness',
  description: 'Fitness Boot Camp platform with comprehensive management features',
  icon: 'dumbbell',

  keywords: [
      "fitness boot camp",
      "fitness",
      "boot",
      "camp",
      "fitness software",
      "fitness app",
      "fitness platform",
      "fitness system",
      "fitness management",
      "fitness fitness"
  ],

  synonyms: [
      "Fitness Boot Camp platform",
      "Fitness Boot Camp software",
      "Fitness Boot Camp system",
      "fitness solution",
      "fitness service"
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
      "Build a fitness boot camp platform",
      "Create a fitness boot camp app",
      "I need a fitness boot camp management system",
      "Build a fitness boot camp solution",
      "Create a fitness boot camp booking system"
  ],
};
