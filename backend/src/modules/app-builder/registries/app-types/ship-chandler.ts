/**
 * Ship Chandler App Type Definition
 *
 * Complete definition for ship chandler applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SHIP_CHANDLER_APP_TYPE: AppTypeDefinition = {
  id: 'ship-chandler',
  name: 'Ship Chandler',
  category: 'logistics',
  description: 'Ship Chandler platform with comprehensive management features',
  icon: 'truck',

  keywords: [
      "ship chandler",
      "ship",
      "chandler",
      "ship software",
      "ship app",
      "ship platform",
      "ship system",
      "ship management",
      "logistics ship"
  ],

  synonyms: [
      "Ship Chandler platform",
      "Ship Chandler software",
      "Ship Chandler system",
      "ship solution",
      "ship service"
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
      "shipment-tracking",
      "route-optimization",
      "fleet-tracking",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "warehouse-mgmt",
      "freight-quotes",
      "carrier-integration",
      "reporting",
      "analytics"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'logistics',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
      "Build a ship chandler platform",
      "Create a ship chandler app",
      "I need a ship chandler management system",
      "Build a ship chandler solution",
      "Create a ship chandler booking system"
  ],
};
