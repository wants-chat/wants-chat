/**
 * Power Sports App Type Definition
 *
 * Complete definition for power sports applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const POWER_SPORTS_APP_TYPE: AppTypeDefinition = {
  id: 'power-sports',
  name: 'Power Sports',
  category: 'fitness',
  description: 'Power Sports platform with comprehensive management features',
  icon: 'dumbbell',

  keywords: [
      "power sports",
      "power",
      "sports",
      "power software",
      "power app",
      "power platform",
      "power system",
      "power management",
      "fitness power"
  ],

  synonyms: [
      "Power Sports platform",
      "Power Sports software",
      "Power Sports system",
      "power solution",
      "power service"
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
      "Build a power sports platform",
      "Create a power sports app",
      "I need a power sports management system",
      "Build a power sports solution",
      "Create a power sports booking system"
  ],
};
