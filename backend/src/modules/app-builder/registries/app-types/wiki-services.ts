/**
 * Wiki Services App Type Definition
 *
 * Complete definition for wiki services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WIKI_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'wiki-services',
  name: 'Wiki Services',
  category: 'services',
  description: 'Wiki Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "wiki services",
      "wiki",
      "services",
      "wiki software",
      "wiki app",
      "wiki platform",
      "wiki system",
      "wiki management",
      "services wiki"
  ],

  synonyms: [
      "Wiki Services platform",
      "Wiki Services software",
      "Wiki Services system",
      "wiki solution",
      "wiki service"
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
      "scheduling",
      "invoicing",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "inventory",
      "payments",
      "reviews",
      "clients",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a wiki services platform",
      "Create a wiki services app",
      "I need a wiki services management system",
      "Build a wiki services solution",
      "Create a wiki services booking system"
  ],
};
