/**
 * Physical Fitness App Type Definition
 *
 * Complete definition for physical fitness applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PHYSICAL_FITNESS_APP_TYPE: AppTypeDefinition = {
  id: 'physical-fitness',
  name: 'Physical Fitness',
  category: 'fitness',
  description: 'Physical Fitness platform with comprehensive management features',
  icon: 'dumbbell',

  keywords: [
      "physical fitness",
      "physical",
      "fitness",
      "physical software",
      "physical app",
      "physical platform",
      "physical system",
      "physical management",
      "fitness physical"
  ],

  synonyms: [
      "Physical Fitness platform",
      "Physical Fitness software",
      "Physical Fitness system",
      "physical solution",
      "physical service"
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
      "Build a physical fitness platform",
      "Create a physical fitness app",
      "I need a physical fitness management system",
      "Build a physical fitness solution",
      "Create a physical fitness booking system"
  ],
};
