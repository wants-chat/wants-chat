/**
 * Animal Transport App Type Definition
 *
 * Complete definition for animal transport applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ANIMAL_TRANSPORT_APP_TYPE: AppTypeDefinition = {
  id: 'animal-transport',
  name: 'Animal Transport',
  category: 'fitness',
  description: 'Animal Transport platform with comprehensive management features',
  icon: 'dumbbell',

  keywords: [
      "animal transport",
      "animal",
      "transport",
      "animal software",
      "animal app",
      "animal platform",
      "animal system",
      "animal management",
      "fitness animal"
  ],

  synonyms: [
      "Animal Transport platform",
      "Animal Transport software",
      "Animal Transport system",
      "animal solution",
      "animal service"
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
      "Build a animal transport platform",
      "Create a animal transport app",
      "I need a animal transport management system",
      "Build a animal transport solution",
      "Create a animal transport booking system"
  ],
};
