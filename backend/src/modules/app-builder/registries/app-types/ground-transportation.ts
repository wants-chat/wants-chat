/**
 * Ground Transportation App Type Definition
 *
 * Complete definition for ground transportation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GROUND_TRANSPORTATION_APP_TYPE: AppTypeDefinition = {
  id: 'ground-transportation',
  name: 'Ground Transportation',
  category: 'transportation',
  description: 'Ground Transportation platform with comprehensive management features',
  icon: 'bus',

  keywords: [
      "ground transportation",
      "ground",
      "transportation",
      "ground software",
      "ground app",
      "ground platform",
      "ground system",
      "ground management",
      "transportation ground"
  ],

  synonyms: [
      "Ground Transportation platform",
      "Ground Transportation software",
      "Ground Transportation system",
      "ground solution",
      "ground service"
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
          "name": "Administrator",
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
          "name": "Staff",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "User",
          "level": 10,
          "isDefault": true,
          "accessibleSections": [
              "frontend"
          ],
          "defaultRoute": "/"
      }
  ],

  defaultFeatures: [
      "user-auth",
      "reservations",
      "fleet-tracking",
      "scheduling",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "route-optimization",
      "reviews",
      "reporting",
      "analytics"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'transportation',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a ground transportation platform",
      "Create a ground transportation app",
      "I need a ground transportation management system",
      "Build a ground transportation solution",
      "Create a ground transportation booking system"
  ],
};
