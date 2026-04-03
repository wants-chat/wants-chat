/**
 * Sports Camp App Type Definition
 *
 * Complete definition for sports camp applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPORTS_CAMP_APP_TYPE: AppTypeDefinition = {
  id: 'sports-camp',
  name: 'Sports Camp',
  category: 'fitness',
  description: 'Sports Camp platform with comprehensive management features',
  icon: 'dumbbell',

  keywords: [
      "sports camp",
      "sports",
      "camp",
      "sports software",
      "sports app",
      "sports platform",
      "sports system",
      "sports management",
      "fitness sports"
  ],

  synonyms: [
      "Sports Camp platform",
      "Sports Camp software",
      "Sports Camp system",
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
      "Build a sports camp platform",
      "Create a sports camp app",
      "I need a sports camp management system",
      "Build a sports camp solution",
      "Create a sports camp booking system"
  ],
};
