/**
 * Swimming Lessons App Type Definition
 *
 * Complete definition for swimming lessons applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SWIMMING_LESSONS_APP_TYPE: AppTypeDefinition = {
  id: 'swimming-lessons',
  name: 'Swimming Lessons',
  category: 'fitness',
  description: 'Swimming Lessons platform with comprehensive management features',
  icon: 'dumbbell',

  keywords: [
      "swimming lessons",
      "swimming",
      "lessons",
      "swimming software",
      "swimming app",
      "swimming platform",
      "swimming system",
      "swimming management",
      "fitness swimming"
  ],

  synonyms: [
      "Swimming Lessons platform",
      "Swimming Lessons software",
      "Swimming Lessons system",
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
      "Build a swimming lessons platform",
      "Create a swimming lessons app",
      "I need a swimming lessons management system",
      "Build a swimming lessons solution",
      "Create a swimming lessons booking system"
  ],
};
