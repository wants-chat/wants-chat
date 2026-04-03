/**
 * Stair Lift App Type Definition
 *
 * Complete definition for stair lift applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STAIR_LIFT_APP_TYPE: AppTypeDefinition = {
  id: 'stair-lift',
  name: 'Stair Lift',
  category: 'services',
  description: 'Stair Lift platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "stair lift",
      "stair",
      "lift",
      "stair software",
      "stair app",
      "stair platform",
      "stair system",
      "stair management",
      "services stair"
  ],

  synonyms: [
      "Stair Lift platform",
      "Stair Lift software",
      "Stair Lift system",
      "stair solution",
      "stair service"
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
      "appointments",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a stair lift platform",
      "Create a stair lift app",
      "I need a stair lift management system",
      "Build a stair lift solution",
      "Create a stair lift booking system"
  ],
};
