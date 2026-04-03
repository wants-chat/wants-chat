/**
 * Kickboxing App Type Definition
 *
 * Complete definition for kickboxing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const KICKBOXING_APP_TYPE: AppTypeDefinition = {
  id: 'kickboxing',
  name: 'Kickboxing',
  category: 'fitness',
  description: 'Kickboxing platform with comprehensive management features',
  icon: 'dumbbell',

  keywords: [
      "kickboxing",
      "kickboxing software",
      "kickboxing app",
      "kickboxing platform",
      "kickboxing system",
      "kickboxing management",
      "fitness kickboxing"
  ],

  synonyms: [
      "Kickboxing platform",
      "Kickboxing software",
      "Kickboxing system",
      "kickboxing solution",
      "kickboxing service"
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
      "Build a kickboxing platform",
      "Create a kickboxing app",
      "I need a kickboxing management system",
      "Build a kickboxing solution",
      "Create a kickboxing booking system"
  ],
};
