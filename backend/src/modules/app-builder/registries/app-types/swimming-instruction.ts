/**
 * Swimming Instruction App Type Definition
 *
 * Complete definition for swimming instruction applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SWIMMING_INSTRUCTION_APP_TYPE: AppTypeDefinition = {
  id: 'swimming-instruction',
  name: 'Swimming Instruction',
  category: 'fitness',
  description: 'Swimming Instruction platform with comprehensive management features',
  icon: 'dumbbell',

  keywords: [
      "swimming instruction",
      "swimming",
      "instruction",
      "swimming software",
      "swimming app",
      "swimming platform",
      "swimming system",
      "swimming management",
      "fitness swimming"
  ],

  synonyms: [
      "Swimming Instruction platform",
      "Swimming Instruction software",
      "Swimming Instruction system",
      "swimming solution",
      "swimming service"
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
      "Build a swimming instruction platform",
      "Create a swimming instruction app",
      "I need a swimming instruction management system",
      "Build a swimming instruction solution",
      "Create a swimming instruction booking system"
  ],
};
