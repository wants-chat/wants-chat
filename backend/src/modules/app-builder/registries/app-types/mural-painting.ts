/**
 * Mural Painting App Type Definition
 *
 * Complete definition for mural painting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MURAL_PAINTING_APP_TYPE: AppTypeDefinition = {
  id: 'mural-painting',
  name: 'Mural Painting',
  category: 'construction',
  description: 'Mural Painting platform with comprehensive management features',
  icon: 'hammer',

  keywords: [
      "mural painting",
      "mural",
      "painting",
      "mural software",
      "mural app",
      "mural platform",
      "mural system",
      "mural management",
      "construction mural"
  ],

  synonyms: [
      "Mural Painting platform",
      "Mural Painting software",
      "Mural Painting system",
      "mural solution",
      "mural service"
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
      "project-bids",
      "daily-logs",
      "calendar",
      "notifications"
  ],

  optionalFeatures: [
      "subcontractor-mgmt",
      "material-takeoffs",
      "invoicing",
      "documents",
      "site-safety"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'construction',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
      "Build a mural painting platform",
      "Create a mural painting app",
      "I need a mural painting management system",
      "Build a mural painting solution",
      "Create a mural painting booking system"
  ],
};
