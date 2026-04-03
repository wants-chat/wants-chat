/**
 * Adaptive Sports App Type Definition
 *
 * Complete definition for adaptive sports applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ADAPTIVE_SPORTS_APP_TYPE: AppTypeDefinition = {
  id: 'adaptive-sports',
  name: 'Adaptive Sports',
  category: 'fitness',
  description: 'Adaptive Sports platform with comprehensive management features',
  icon: 'dumbbell',

  keywords: [
      "adaptive sports",
      "adaptive",
      "sports",
      "adaptive software",
      "adaptive app",
      "adaptive platform",
      "adaptive system",
      "adaptive management",
      "fitness adaptive"
  ],

  synonyms: [
      "Adaptive Sports platform",
      "Adaptive Sports software",
      "Adaptive Sports system",
      "adaptive solution",
      "adaptive service"
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
      "Build a adaptive sports platform",
      "Create a adaptive sports app",
      "I need a adaptive sports management system",
      "Build a adaptive sports solution",
      "Create a adaptive sports booking system"
  ],
};
