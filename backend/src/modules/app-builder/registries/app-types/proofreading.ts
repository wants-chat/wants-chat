/**
 * Proofreading App Type Definition
 *
 * Complete definition for proofreading applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PROOFREADING_APP_TYPE: AppTypeDefinition = {
  id: 'proofreading',
  name: 'Proofreading',
  category: 'construction',
  description: 'Proofreading platform with comprehensive management features',
  icon: 'hammer',

  keywords: [
      "proofreading",
      "proofreading software",
      "proofreading app",
      "proofreading platform",
      "proofreading system",
      "proofreading management",
      "construction proofreading"
  ],

  synonyms: [
      "Proofreading platform",
      "Proofreading software",
      "Proofreading system",
      "proofreading solution",
      "proofreading service"
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
      "Build a proofreading platform",
      "Create a proofreading app",
      "I need a proofreading management system",
      "Build a proofreading solution",
      "Create a proofreading booking system"
  ],
};
