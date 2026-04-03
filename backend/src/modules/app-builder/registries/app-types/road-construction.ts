/**
 * Road Construction App Type Definition
 *
 * Complete definition for road construction applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ROAD_CONSTRUCTION_APP_TYPE: AppTypeDefinition = {
  id: 'road-construction',
  name: 'Road Construction',
  category: 'construction',
  description: 'Road Construction platform with comprehensive management features',
  icon: 'hammer',

  keywords: [
      "road construction",
      "road",
      "construction",
      "road software",
      "road app",
      "road platform",
      "road system",
      "road management",
      "construction road"
  ],

  synonyms: [
      "Road Construction platform",
      "Road Construction software",
      "Road Construction system",
      "road solution",
      "road service"
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
      "Build a road construction platform",
      "Create a road construction app",
      "I need a road construction management system",
      "Build a road construction solution",
      "Create a road construction booking system"
  ],
};
