/**
 * Recreational Sports App Type Definition
 *
 * Complete definition for recreational sports applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RECREATIONAL_SPORTS_APP_TYPE: AppTypeDefinition = {
  id: 'recreational-sports',
  name: 'Recreational Sports',
  category: 'fitness',
  description: 'Recreational Sports platform with comprehensive management features',
  icon: 'dumbbell',

  keywords: [
      "recreational sports",
      "recreational",
      "sports",
      "recreational software",
      "recreational app",
      "recreational platform",
      "recreational system",
      "recreational management",
      "fitness recreational"
  ],

  synonyms: [
      "Recreational Sports platform",
      "Recreational Sports software",
      "Recreational Sports system",
      "recreational solution",
      "recreational service"
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
      "Build a recreational sports platform",
      "Create a recreational sports app",
      "I need a recreational sports management system",
      "Build a recreational sports solution",
      "Create a recreational sports booking system"
  ],
};
