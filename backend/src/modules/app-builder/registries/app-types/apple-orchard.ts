/**
 * Apple Orchard App Type Definition
 *
 * Complete definition for apple orchard applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const APPLE_ORCHARD_APP_TYPE: AppTypeDefinition = {
  id: 'apple-orchard',
  name: 'Apple Orchard',
  category: 'technology',
  description: 'Apple Orchard platform with comprehensive management features',
  icon: 'code',

  keywords: [
      "apple orchard",
      "apple",
      "orchard",
      "apple software",
      "apple app",
      "apple platform",
      "apple system",
      "apple management",
      "technology apple"
  ],

  synonyms: [
      "Apple Orchard platform",
      "Apple Orchard software",
      "Apple Orchard system",
      "apple solution",
      "apple service"
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
      "projects",
      "tasks",
      "documents",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "time-tracking",
      "invoicing",
      "clients",
      "reporting",
      "analytics"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'technology',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a apple orchard platform",
      "Create a apple orchard app",
      "I need a apple orchard management system",
      "Build a apple orchard solution",
      "Create a apple orchard booking system"
  ],
};
