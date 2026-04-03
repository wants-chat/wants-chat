/**
 * Transit Advertising App Type Definition
 *
 * Complete definition for transit advertising applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRANSIT_ADVERTISING_APP_TYPE: AppTypeDefinition = {
  id: 'transit-advertising',
  name: 'Transit Advertising',
  category: 'technology',
  description: 'Transit Advertising platform with comprehensive management features',
  icon: 'code',

  keywords: [
      "transit advertising",
      "transit",
      "advertising",
      "transit software",
      "transit app",
      "transit platform",
      "transit system",
      "transit management",
      "technology transit"
  ],

  synonyms: [
      "Transit Advertising platform",
      "Transit Advertising software",
      "Transit Advertising system",
      "transit solution",
      "transit service"
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
      "tasks",
      "documents",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "time-tracking",
      "invoicing",
      "clients",
      "reporting",
      "analytics"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'technology',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a transit advertising platform",
      "Create a transit advertising app",
      "I need a transit advertising management system",
      "Build a transit advertising solution",
      "Create a transit advertising booking system"
  ],
};
