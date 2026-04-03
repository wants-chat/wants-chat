/**
 * Water Sports App Type Definition
 *
 * Complete definition for water sports applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WATER_SPORTS_APP_TYPE: AppTypeDefinition = {
  id: 'water-sports',
  name: 'Water Sports',
  category: 'fitness',
  description: 'Water Sports platform with comprehensive management features',
  icon: 'dumbbell',

  keywords: [
      "water sports",
      "water",
      "sports",
      "water software",
      "water app",
      "water platform",
      "water system",
      "water management",
      "fitness water"
  ],

  synonyms: [
      "Water Sports platform",
      "Water Sports software",
      "Water Sports system",
      "water solution",
      "water service"
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
      "Build a water sports platform",
      "Create a water sports app",
      "I need a water sports management system",
      "Build a water sports solution",
      "Create a water sports booking system"
  ],
};
