/**
 * Cargo Transport App Type Definition
 *
 * Complete definition for cargo transport applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CARGO_TRANSPORT_APP_TYPE: AppTypeDefinition = {
  id: 'cargo-transport',
  name: 'Cargo Transport',
  category: 'fitness',
  description: 'Cargo Transport platform with comprehensive management features',
  icon: 'dumbbell',

  keywords: [
      "cargo transport",
      "cargo",
      "transport",
      "cargo software",
      "cargo app",
      "cargo platform",
      "cargo system",
      "cargo management",
      "fitness cargo"
  ],

  synonyms: [
      "Cargo Transport platform",
      "Cargo Transport software",
      "Cargo Transport system",
      "cargo solution",
      "cargo service"
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
      "Build a cargo transport platform",
      "Create a cargo transport app",
      "I need a cargo transport management system",
      "Build a cargo transport solution",
      "Create a cargo transport booking system"
  ],
};
