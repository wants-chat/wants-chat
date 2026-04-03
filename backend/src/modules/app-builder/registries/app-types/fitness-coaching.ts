/**
 * Fitness Coaching App Type Definition
 *
 * Complete definition for fitness coaching applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FITNESS_COACHING_APP_TYPE: AppTypeDefinition = {
  id: 'fitness-coaching',
  name: 'Fitness Coaching',
  category: 'fitness',
  description: 'Fitness Coaching platform with comprehensive management features',
  icon: 'dumbbell',

  keywords: [
      "fitness coaching",
      "fitness",
      "coaching",
      "fitness software",
      "fitness app",
      "fitness platform",
      "fitness system",
      "fitness management",
      "fitness fitness"
  ],

  synonyms: [
      "Fitness Coaching platform",
      "Fitness Coaching software",
      "Fitness Coaching system",
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
      "Build a fitness coaching platform",
      "Create a fitness coaching app",
      "I need a fitness coaching management system",
      "Build a fitness coaching solution",
      "Create a fitness coaching booking system"
  ],
};
