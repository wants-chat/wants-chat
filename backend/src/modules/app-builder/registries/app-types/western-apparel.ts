/**
 * Western Apparel App Type Definition
 *
 * Complete definition for western apparel applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WESTERN_APPAREL_APP_TYPE: AppTypeDefinition = {
  id: 'western-apparel',
  name: 'Western Apparel',
  category: 'technology',
  description: 'Western Apparel platform with comprehensive management features',
  icon: 'code',

  keywords: [
      "western apparel",
      "western",
      "apparel",
      "western software",
      "western app",
      "western platform",
      "western system",
      "western management",
      "technology western"
  ],

  synonyms: [
      "Western Apparel platform",
      "Western Apparel software",
      "Western Apparel system",
      "western solution",
      "western service"
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
      "Build a western apparel platform",
      "Create a western apparel app",
      "I need a western apparel management system",
      "Build a western apparel solution",
      "Create a western apparel booking system"
  ],
};
