/**
 * Roof Cleaning App Type Definition
 *
 * Complete definition for roof cleaning applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ROOF_CLEANING_APP_TYPE: AppTypeDefinition = {
  id: 'roof-cleaning',
  name: 'Roof Cleaning',
  category: 'construction',
  description: 'Roof Cleaning platform with comprehensive management features',
  icon: 'hammer',

  keywords: [
      "roof cleaning",
      "roof",
      "cleaning",
      "roof software",
      "roof app",
      "roof platform",
      "roof system",
      "roof management",
      "construction roof"
  ],

  synonyms: [
      "Roof Cleaning platform",
      "Roof Cleaning software",
      "Roof Cleaning system",
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
      "Build a roof cleaning platform",
      "Create a roof cleaning app",
      "I need a roof cleaning management system",
      "Build a roof cleaning solution",
      "Create a roof cleaning booking system"
  ],
};
