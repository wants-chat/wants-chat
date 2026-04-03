/**
 * Athletic Performance App Type Definition
 *
 * Complete definition for athletic performance applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ATHLETIC_PERFORMANCE_APP_TYPE: AppTypeDefinition = {
  id: 'athletic-performance',
  name: 'Athletic Performance',
  category: 'fitness',
  description: 'Athletic Performance platform with comprehensive management features',
  icon: 'dumbbell',

  keywords: [
      "athletic performance",
      "athletic",
      "performance",
      "athletic software",
      "athletic app",
      "athletic platform",
      "athletic system",
      "athletic management",
      "fitness athletic"
  ],

  synonyms: [
      "Athletic Performance platform",
      "Athletic Performance software",
      "Athletic Performance system",
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
      "Build a athletic performance platform",
      "Create a athletic performance app",
      "I need a athletic performance management system",
      "Build a athletic performance solution",
      "Create a athletic performance booking system"
  ],
};
