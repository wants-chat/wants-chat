/**
 * Sports Management App Type Definition
 *
 * Complete definition for sports management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPORTS_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'sports-management',
  name: 'Sports Management',
  category: 'fitness',
  description: 'Sports Management platform with comprehensive management features',
  icon: 'dumbbell',

  keywords: [
      "sports management",
      "sports",
      "management",
      "sports software",
      "sports app",
      "sports platform",
      "sports system",
      "fitness sports"
  ],

  synonyms: [
      "Sports Management platform",
      "Sports Management software",
      "Sports Management system",
      "sports solution",
      "sports service"
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
      "Build a sports management platform",
      "Create a sports management app",
      "I need a sports management management system",
      "Build a sports management solution",
      "Create a sports management booking system"
  ],
};
