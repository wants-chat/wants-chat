/**
 * Athletic Footwear App Type Definition
 *
 * Complete definition for athletic footwear applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ATHLETIC_FOOTWEAR_APP_TYPE: AppTypeDefinition = {
  id: 'athletic-footwear',
  name: 'Athletic Footwear',
  category: 'fitness',
  description: 'Athletic Footwear platform with comprehensive management features',
  icon: 'dumbbell',

  keywords: [
      "athletic footwear",
      "athletic",
      "footwear",
      "athletic software",
      "athletic app",
      "athletic platform",
      "athletic system",
      "athletic management",
      "fitness athletic"
  ],

  synonyms: [
      "Athletic Footwear platform",
      "Athletic Footwear software",
      "Athletic Footwear system",
      "athletic solution",
      "athletic service"
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
      "Build a athletic footwear platform",
      "Create a athletic footwear app",
      "I need a athletic footwear management system",
      "Build a athletic footwear solution",
      "Create a athletic footwear booking system"
  ],
};
