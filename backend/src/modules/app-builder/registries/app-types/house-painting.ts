/**
 * House Painting App Type Definition
 *
 * Complete definition for house painting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HOUSE_PAINTING_APP_TYPE: AppTypeDefinition = {
  id: 'house-painting',
  name: 'House Painting',
  category: 'construction',
  description: 'House Painting platform with comprehensive management features',
  icon: 'hammer',

  keywords: [
      "house painting",
      "house",
      "painting",
      "house software",
      "house app",
      "house platform",
      "house system",
      "house management",
      "construction house"
  ],

  synonyms: [
      "House Painting platform",
      "House Painting software",
      "House Painting system",
      "house solution",
      "house service"
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
      "Build a house painting platform",
      "Create a house painting app",
      "I need a house painting management system",
      "Build a house painting solution",
      "Create a house painting booking system"
  ],
};
