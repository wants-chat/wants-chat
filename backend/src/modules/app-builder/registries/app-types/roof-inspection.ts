/**
 * Roof Inspection App Type Definition
 *
 * Complete definition for roof inspection applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ROOF_INSPECTION_APP_TYPE: AppTypeDefinition = {
  id: 'roof-inspection',
  name: 'Roof Inspection',
  category: 'construction',
  description: 'Roof Inspection platform with comprehensive management features',
  icon: 'hammer',

  keywords: [
      "roof inspection",
      "roof",
      "inspection",
      "roof software",
      "roof app",
      "roof platform",
      "roof system",
      "roof management",
      "construction roof"
  ],

  synonyms: [
      "Roof Inspection platform",
      "Roof Inspection software",
      "Roof Inspection system",
      "roof solution",
      "roof service"
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
      "Build a roof inspection platform",
      "Create a roof inspection app",
      "I need a roof inspection management system",
      "Build a roof inspection solution",
      "Create a roof inspection booking system"
  ],
};
