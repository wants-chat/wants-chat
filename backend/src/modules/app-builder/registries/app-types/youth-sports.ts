/**
 * Youth Sports App Type Definition
 *
 * Complete definition for youth sports applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YOUTH_SPORTS_APP_TYPE: AppTypeDefinition = {
  id: 'youth-sports',
  name: 'Youth Sports',
  category: 'fitness',
  description: 'Youth Sports platform with comprehensive management features',
  icon: 'dumbbell',

  keywords: [
      "youth sports",
      "youth",
      "sports",
      "youth software",
      "youth app",
      "youth platform",
      "youth system",
      "youth management",
      "fitness youth"
  ],

  synonyms: [
      "Youth Sports platform",
      "Youth Sports software",
      "Youth Sports system",
      "youth solution",
      "youth service"
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
      "Build a youth sports platform",
      "Create a youth sports app",
      "I need a youth sports management system",
      "Build a youth sports solution",
      "Create a youth sports booking system"
  ],
};
