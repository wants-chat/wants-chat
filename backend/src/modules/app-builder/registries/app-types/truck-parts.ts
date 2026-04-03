/**
 * Truck Parts App Type Definition
 *
 * Complete definition for truck parts applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRUCK_PARTS_APP_TYPE: AppTypeDefinition = {
  id: 'truck-parts',
  name: 'Truck Parts',
  category: 'logistics',
  description: 'Truck Parts platform with comprehensive management features',
  icon: 'truck',

  keywords: [
      "truck parts",
      "truck",
      "parts",
      "truck software",
      "truck app",
      "truck platform",
      "truck system",
      "truck management",
      "logistics truck"
  ],

  synonyms: [
      "Truck Parts platform",
      "Truck Parts software",
      "Truck Parts system",
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
      "Build a truck parts platform",
      "Create a truck parts app",
      "I need a truck parts management system",
      "Build a truck parts solution",
      "Create a truck parts booking system"
  ],
};
