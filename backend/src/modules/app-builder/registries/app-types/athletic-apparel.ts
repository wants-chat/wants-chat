/**
 * Athletic Apparel App Type Definition
 *
 * Complete definition for athletic apparel applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ATHLETIC_APPAREL_APP_TYPE: AppTypeDefinition = {
  id: 'athletic-apparel',
  name: 'Athletic Apparel',
  category: 'fitness',
  description: 'Athletic Apparel platform with comprehensive management features',
  icon: 'dumbbell',

  keywords: [
      "athletic apparel",
      "athletic",
      "apparel",
      "athletic software",
      "athletic app",
      "athletic platform",
      "athletic system",
      "athletic management",
      "fitness athletic"
  ],

  synonyms: [
      "Athletic Apparel platform",
      "Athletic Apparel software",
      "Athletic Apparel system",
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
      "Build a athletic apparel platform",
      "Create a athletic apparel app",
      "I need a athletic apparel management system",
      "Build a athletic apparel solution",
      "Create a athletic apparel booking system"
  ],
};
