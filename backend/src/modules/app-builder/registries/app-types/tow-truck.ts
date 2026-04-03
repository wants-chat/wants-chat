/**
 * Tow Truck App Type Definition
 *
 * Complete definition for tow truck applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TOW_TRUCK_APP_TYPE: AppTypeDefinition = {
  id: 'tow-truck',
  name: 'Tow Truck',
  category: 'logistics',
  description: 'Tow Truck platform with comprehensive management features',
  icon: 'truck',

  keywords: [
      "tow truck",
      "tow",
      "truck",
      "tow software",
      "tow app",
      "tow platform",
      "tow system",
      "tow management",
      "logistics tow"
  ],

  synonyms: [
      "Tow Truck platform",
      "Tow Truck software",
      "Tow Truck system",
      "tow solution",
      "tow service"
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
      "Build a tow truck platform",
      "Create a tow truck app",
      "I need a tow truck management system",
      "Build a tow truck solution",
      "Create a tow truck booking system"
  ],
};
