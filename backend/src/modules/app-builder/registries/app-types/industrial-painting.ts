/**
 * Industrial Painting App Type Definition
 *
 * Complete definition for industrial painting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const INDUSTRIAL_PAINTING_APP_TYPE: AppTypeDefinition = {
  id: 'industrial-painting',
  name: 'Industrial Painting',
  category: 'construction',
  description: 'Industrial Painting platform with comprehensive management features',
  icon: 'hammer',

  keywords: [
      "industrial painting",
      "industrial",
      "painting",
      "industrial software",
      "industrial app",
      "industrial platform",
      "industrial system",
      "industrial management",
      "construction industrial"
  ],

  synonyms: [
      "Industrial Painting platform",
      "Industrial Painting software",
      "Industrial Painting system",
      "industrial solution",
      "industrial service"
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
      "Build a industrial painting platform",
      "Create a industrial painting app",
      "I need a industrial painting management system",
      "Build a industrial painting solution",
      "Create a industrial painting booking system"
  ],
};
