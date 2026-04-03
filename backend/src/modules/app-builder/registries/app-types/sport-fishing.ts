/**
 * Sport Fishing App Type Definition
 *
 * Complete definition for sport fishing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPORT_FISHING_APP_TYPE: AppTypeDefinition = {
  id: 'sport-fishing',
  name: 'Sport Fishing',
  category: 'fitness',
  description: 'Sport Fishing platform with comprehensive management features',
  icon: 'dumbbell',

  keywords: [
      "sport fishing",
      "sport",
      "fishing",
      "sport software",
      "sport app",
      "sport platform",
      "sport system",
      "sport management",
      "fitness sport"
  ],

  synonyms: [
      "Sport Fishing platform",
      "Sport Fishing software",
      "Sport Fishing system",
      "sport solution",
      "sport service"
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
      "Build a sport fishing platform",
      "Create a sport fishing app",
      "I need a sport fishing management system",
      "Build a sport fishing solution",
      "Create a sport fishing booking system"
  ],
};
