/**
 * Truck Stop App Type Definition
 *
 * Complete definition for truck stop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRUCK_STOP_APP_TYPE: AppTypeDefinition = {
  id: 'truck-stop',
  name: 'Truck Stop',
  category: 'logistics',
  description: 'Truck Stop platform with comprehensive management features',
  icon: 'truck',

  keywords: [
      "truck stop",
      "truck",
      "stop",
      "truck software",
      "truck app",
      "truck platform",
      "truck system",
      "truck management",
      "logistics truck"
  ],

  synonyms: [
      "Truck Stop platform",
      "Truck Stop software",
      "Truck Stop system",
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
      "Build a truck stop platform",
      "Create a truck stop app",
      "I need a truck stop management system",
      "Build a truck stop solution",
      "Create a truck stop booking system"
  ],
};
