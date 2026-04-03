/**
 * Shed Builder App Type Definition
 *
 * Complete definition for shed builder applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SHED_BUILDER_APP_TYPE: AppTypeDefinition = {
  id: 'shed-builder',
  name: 'Shed Builder',
  category: 'construction',
  description: 'Shed Builder platform with comprehensive management features',
  icon: 'hammer',

  keywords: [
      "shed builder",
      "shed",
      "builder",
      "shed software",
      "shed app",
      "shed platform",
      "shed system",
      "shed management",
      "construction shed"
  ],

  synonyms: [
      "Shed Builder platform",
      "Shed Builder software",
      "Shed Builder system",
      "shed solution",
      "shed service"
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
      "Build a shed builder platform",
      "Create a shed builder app",
      "I need a shed builder management system",
      "Build a shed builder solution",
      "Create a shed builder booking system"
  ],
};
