/**
 * Passport Services App Type Definition
 *
 * Complete definition for passport services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PASSPORT_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'passport-services',
  name: 'Passport Services',
  category: 'fitness',
  description: 'Passport Services platform with comprehensive management features',
  icon: 'dumbbell',

  keywords: [
      "passport services",
      "passport",
      "services",
      "passport software",
      "passport app",
      "passport platform",
      "passport system",
      "passport management",
      "fitness passport"
  ],

  synonyms: [
      "Passport Services platform",
      "Passport Services software",
      "Passport Services system",
      "passport solution",
      "passport service"
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
      "Build a passport services platform",
      "Create a passport services app",
      "I need a passport services management system",
      "Build a passport services solution",
      "Create a passport services booking system"
  ],
};
