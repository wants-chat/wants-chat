/**
 * Residential Painting App Type Definition
 *
 * Complete definition for residential painting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RESIDENTIAL_PAINTING_APP_TYPE: AppTypeDefinition = {
  id: 'residential-painting',
  name: 'Residential Painting',
  category: 'construction',
  description: 'Residential Painting platform with comprehensive management features',
  icon: 'hammer',

  keywords: [
      "residential painting",
      "residential",
      "painting",
      "residential software",
      "residential app",
      "residential platform",
      "residential system",
      "residential management",
      "construction residential"
  ],

  synonyms: [
      "Residential Painting platform",
      "Residential Painting software",
      "Residential Painting system",
      "residential solution",
      "residential service"
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
      "Build a residential painting platform",
      "Create a residential painting app",
      "I need a residential painting management system",
      "Build a residential painting solution",
      "Create a residential painting booking system"
  ],
};
