/**
 * Hurricane Shutters App Type Definition
 *
 * Complete definition for hurricane shutters applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HURRICANE_SHUTTERS_APP_TYPE: AppTypeDefinition = {
  id: 'hurricane-shutters',
  name: 'Hurricane Shutters',
  category: 'services',
  description: 'Hurricane Shutters platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "hurricane shutters",
      "hurricane",
      "shutters",
      "hurricane software",
      "hurricane app",
      "hurricane platform",
      "hurricane system",
      "hurricane management",
      "services hurricane"
  ],

  synonyms: [
      "Hurricane Shutters platform",
      "Hurricane Shutters software",
      "Hurricane Shutters system",
      "hurricane solution",
      "hurricane service"
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
      "Build a hurricane shutters platform",
      "Create a hurricane shutters app",
      "I need a hurricane shutters management system",
      "Build a hurricane shutters solution",
      "Create a hurricane shutters booking system"
  ],
};
