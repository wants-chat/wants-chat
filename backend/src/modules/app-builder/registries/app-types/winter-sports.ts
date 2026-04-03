/**
 * Winter Sports App Type Definition
 *
 * Complete definition for winter sports applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WINTER_SPORTS_APP_TYPE: AppTypeDefinition = {
  id: 'winter-sports',
  name: 'Winter Sports',
  category: 'fitness',
  description: 'Winter Sports platform with comprehensive management features',
  icon: 'dumbbell',

  keywords: [
      "winter sports",
      "winter",
      "sports",
      "winter software",
      "winter app",
      "winter platform",
      "winter system",
      "winter management",
      "fitness winter"
  ],

  synonyms: [
      "Winter Sports platform",
      "Winter Sports software",
      "Winter Sports system",
      "winter solution",
      "winter service"
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
      "Build a winter sports platform",
      "Create a winter sports app",
      "I need a winter sports management system",
      "Build a winter sports solution",
      "Create a winter sports booking system"
  ],
};
