/**
 * Apparel Manufacturing App Type Definition
 *
 * Complete definition for apparel manufacturing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const APPAREL_MANUFACTURING_APP_TYPE: AppTypeDefinition = {
  id: 'apparel-manufacturing',
  name: 'Apparel Manufacturing',
  category: 'technology',
  description: 'Apparel Manufacturing platform with comprehensive management features',
  icon: 'code',

  keywords: [
      "apparel manufacturing",
      "apparel",
      "manufacturing",
      "apparel software",
      "apparel app",
      "apparel platform",
      "apparel system",
      "apparel management",
      "technology apparel"
  ],

  synonyms: [
      "Apparel Manufacturing platform",
      "Apparel Manufacturing software",
      "Apparel Manufacturing system",
      "apparel solution",
      "apparel service"
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
      "Build a apparel manufacturing platform",
      "Create a apparel manufacturing app",
      "I need a apparel manufacturing management system",
      "Build a apparel manufacturing solution",
      "Create a apparel manufacturing booking system"
  ],
};
