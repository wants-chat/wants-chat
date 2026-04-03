/**
 * Sports Goods App Type Definition
 *
 * Complete definition for sports goods applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPORTS_GOODS_APP_TYPE: AppTypeDefinition = {
  id: 'sports-goods',
  name: 'Sports Goods',
  category: 'fitness',
  description: 'Sports Goods platform with comprehensive management features',
  icon: 'dumbbell',

  keywords: [
      "sports goods",
      "sports",
      "goods",
      "sports software",
      "sports app",
      "sports platform",
      "sports system",
      "sports management",
      "fitness sports"
  ],

  synonyms: [
      "Sports Goods platform",
      "Sports Goods software",
      "Sports Goods system",
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
      "Build a sports goods platform",
      "Create a sports goods app",
      "I need a sports goods management system",
      "Build a sports goods solution",
      "Create a sports goods booking system"
  ],
};
