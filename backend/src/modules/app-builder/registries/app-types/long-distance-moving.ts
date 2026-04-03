/**
 * Long Distance Moving App Type Definition
 *
 * Complete definition for long distance moving applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LONG_DISTANCE_MOVING_APP_TYPE: AppTypeDefinition = {
  id: 'long-distance-moving',
  name: 'Long Distance Moving',
  category: 'logistics',
  description: 'Long Distance Moving platform with comprehensive management features',
  icon: 'truck',

  keywords: [
      "long distance moving",
      "long",
      "distance",
      "moving",
      "long software",
      "long app",
      "long platform",
      "long system",
      "long management",
      "services long"
  ],

  synonyms: [
      "Long Distance Moving platform",
      "Long Distance Moving software",
      "Long Distance Moving system",
      "long solution",
      "long service"
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
      "scheduling",
      "invoicing",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "inventory",
      "payments",
      "reviews",
      "contracts",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a long distance moving platform",
      "Create a long distance moving app",
      "I need a long distance moving management system",
      "Build a long distance moving solution",
      "Create a long distance moving booking system"
  ],
};
