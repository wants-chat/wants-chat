/**
 * Pilates App Type Definition
 *
 * Complete definition for pilates applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PILATES_APP_TYPE: AppTypeDefinition = {
  id: 'pilates',
  name: 'Pilates',
  category: 'fitness',
  description: 'Pilates platform with comprehensive management features',
  icon: 'dumbbell',

  keywords: [
      "pilates",
      "pilates software",
      "pilates app",
      "pilates platform",
      "pilates system",
      "pilates management",
      "fitness pilates"
  ],

  synonyms: [
      "Pilates platform",
      "Pilates software",
      "Pilates system",
      "pilates solution",
      "pilates service"
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
      "Build a pilates platform",
      "Create a pilates app",
      "I need a pilates management system",
      "Build a pilates solution",
      "Create a pilates booking system"
  ],
};
