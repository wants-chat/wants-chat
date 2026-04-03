/**
 * Swimming Pool Service App Type Definition
 *
 * Complete definition for swimming pool service applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SWIMMING_POOL_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: 'swimming-pool-service',
  name: 'Swimming Pool Service',
  category: 'fitness',
  description: 'Swimming Pool Service platform with comprehensive management features',
  icon: 'dumbbell',

  keywords: [
      "swimming pool service",
      "swimming",
      "pool",
      "service",
      "swimming software",
      "swimming app",
      "swimming platform",
      "swimming system",
      "swimming management",
      "fitness swimming"
  ],

  synonyms: [
      "Swimming Pool Service platform",
      "Swimming Pool Service software",
      "Swimming Pool Service system",
      "swimming solution",
      "swimming service"
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
      "Build a swimming pool service platform",
      "Create a swimming pool service app",
      "I need a swimming pool service management system",
      "Build a swimming pool service solution",
      "Create a swimming pool service booking system"
  ],
};
