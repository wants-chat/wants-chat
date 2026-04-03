/**
 * New Construction App Type Definition
 *
 * Complete definition for new construction applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const NEW_CONSTRUCTION_APP_TYPE: AppTypeDefinition = {
  id: 'new-construction',
  name: 'New Construction',
  category: 'construction',
  description: 'New Construction platform with comprehensive management features',
  icon: 'hammer',

  keywords: [
      "new construction",
      "new",
      "construction",
      "new software",
      "new app",
      "new platform",
      "new system",
      "new management",
      "construction new"
  ],

  synonyms: [
      "New Construction platform",
      "New Construction software",
      "New Construction system",
      "new solution",
      "new service"
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
      "Build a new construction platform",
      "Create a new construction app",
      "I need a new construction management system",
      "Build a new construction solution",
      "Create a new construction booking system"
  ],
};
