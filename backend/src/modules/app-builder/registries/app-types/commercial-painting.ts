/**
 * Commercial Painting App Type Definition
 *
 * Complete definition for commercial painting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const COMMERCIAL_PAINTING_APP_TYPE: AppTypeDefinition = {
  id: 'commercial-painting',
  name: 'Commercial Painting',
  category: 'construction',
  description: 'Commercial Painting platform with comprehensive management features',
  icon: 'hammer',

  keywords: [
      "commercial painting",
      "commercial",
      "painting",
      "commercial software",
      "commercial app",
      "commercial platform",
      "commercial system",
      "commercial management",
      "construction commercial"
  ],

  synonyms: [
      "Commercial Painting platform",
      "Commercial Painting software",
      "Commercial Painting system",
      "commercial solution",
      "commercial service"
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
      "Build a commercial painting platform",
      "Create a commercial painting app",
      "I need a commercial painting management system",
      "Build a commercial painting solution",
      "Create a commercial painting booking system"
  ],
};
