/**
 * Womens Fitness App Type Definition
 *
 * Complete definition for womens fitness applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WOMENS_FITNESS_APP_TYPE: AppTypeDefinition = {
  id: 'womens-fitness',
  name: 'Womens Fitness',
  category: 'fitness',
  description: 'Womens Fitness platform with comprehensive management features',
  icon: 'dumbbell',

  keywords: [
      "womens fitness",
      "womens",
      "fitness",
      "womens software",
      "womens app",
      "womens platform",
      "womens system",
      "womens management",
      "fitness womens"
  ],

  synonyms: [
      "Womens Fitness platform",
      "Womens Fitness software",
      "Womens Fitness system",
      "womens solution",
      "womens service"
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
      "Build a womens fitness platform",
      "Create a womens fitness app",
      "I need a womens fitness management system",
      "Build a womens fitness solution",
      "Create a womens fitness booking system"
  ],
};
