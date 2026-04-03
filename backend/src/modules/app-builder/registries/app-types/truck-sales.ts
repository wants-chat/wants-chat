/**
 * Truck Sales App Type Definition
 *
 * Complete definition for truck sales applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRUCK_SALES_APP_TYPE: AppTypeDefinition = {
  id: 'truck-sales',
  name: 'Truck Sales',
  category: 'logistics',
  description: 'Truck Sales platform with comprehensive management features',
  icon: 'truck',

  keywords: [
      "truck sales",
      "truck",
      "sales",
      "truck software",
      "truck app",
      "truck platform",
      "truck system",
      "truck management",
      "logistics truck"
  ],

  synonyms: [
      "Truck Sales platform",
      "Truck Sales software",
      "Truck Sales system",
      "truck solution",
      "truck service"
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
      "Build a truck sales platform",
      "Create a truck sales app",
      "I need a truck sales management system",
      "Build a truck sales solution",
      "Create a truck sales booking system"
  ],
};
