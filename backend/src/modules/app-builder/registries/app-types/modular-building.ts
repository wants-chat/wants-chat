/**
 * Modular Building App Type Definition
 *
 * Complete definition for modular building applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MODULAR_BUILDING_APP_TYPE: AppTypeDefinition = {
  id: 'modular-building',
  name: 'Modular Building',
  category: 'services',
  description: 'Modular Building platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "modular building",
      "modular",
      "building",
      "modular software",
      "modular app",
      "modular platform",
      "modular system",
      "modular management",
      "services modular"
  ],

  synonyms: [
      "Modular Building platform",
      "Modular Building software",
      "Modular Building system",
      "modular solution",
      "modular service"
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
      "Build a modular building platform",
      "Create a modular building app",
      "I need a modular building management system",
      "Build a modular building solution",
      "Create a modular building booking system"
  ],
};
