/**
 * Sportswear App Type Definition
 *
 * Complete definition for sportswear applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPORTSWEAR_APP_TYPE: AppTypeDefinition = {
  id: 'sportswear',
  name: 'Sportswear',
  category: 'fitness',
  description: 'Sportswear platform with comprehensive management features',
  icon: 'dumbbell',

  keywords: [
      "sportswear",
      "sportswear software",
      "sportswear app",
      "sportswear platform",
      "sportswear system",
      "sportswear management",
      "fitness sportswear"
  ],

  synonyms: [
      "Sportswear platform",
      "Sportswear software",
      "Sportswear system",
      "sportswear solution",
      "sportswear service"
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
      "Build a sportswear platform",
      "Create a sportswear app",
      "I need a sportswear management system",
      "Build a sportswear solution",
      "Create a sportswear booking system"
  ],
};
