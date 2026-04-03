/**
 * Sports Nutrition App Type Definition
 *
 * Complete definition for sports nutrition applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPORTS_NUTRITION_APP_TYPE: AppTypeDefinition = {
  id: 'sports-nutrition',
  name: 'Sports Nutrition',
  category: 'fitness',
  description: 'Sports Nutrition platform with comprehensive management features',
  icon: 'dumbbell',

  keywords: [
      "sports nutrition",
      "sports",
      "nutrition",
      "sports software",
      "sports app",
      "sports platform",
      "sports system",
      "sports management",
      "fitness sports"
  ],

  synonyms: [
      "Sports Nutrition platform",
      "Sports Nutrition software",
      "Sports Nutrition system",
      "sports solution",
      "sports service"
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
      "Build a sports nutrition platform",
      "Create a sports nutrition app",
      "I need a sports nutrition management system",
      "Build a sports nutrition solution",
      "Create a sports nutrition booking system"
  ],
};
