/**
 * Truck Leasing App Type Definition
 *
 * Complete definition for truck leasing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRUCK_LEASING_APP_TYPE: AppTypeDefinition = {
  id: 'truck-leasing',
  name: 'Truck Leasing',
  category: 'logistics',
  description: 'Truck Leasing platform with comprehensive management features',
  icon: 'truck',

  keywords: [
      "truck leasing",
      "truck",
      "leasing",
      "truck software",
      "truck app",
      "truck platform",
      "truck system",
      "truck management",
      "logistics truck"
  ],

  synonyms: [
      "Truck Leasing platform",
      "Truck Leasing software",
      "Truck Leasing system",
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
      "Build a truck leasing platform",
      "Create a truck leasing app",
      "I need a truck leasing management system",
      "Build a truck leasing solution",
      "Create a truck leasing booking system"
  ],
};
