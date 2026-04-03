/**
 * Logistics App Type Definition
 *
 * Complete definition for logistics applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LOGISTICS_APP_TYPE: AppTypeDefinition = {
  id: 'logistics',
  name: 'Logistics',
  category: 'logistics',
  description: 'Logistics platform with comprehensive management features',
  icon: 'truck',

  keywords: [
      "logistics",
      "logistics software",
      "logistics app",
      "logistics platform",
      "logistics system",
      "logistics management",
      "logistics logistics"
  ],

  synonyms: [
      "Logistics platform",
      "Logistics software",
      "Logistics system",
      "logistics solution",
      "logistics service"
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
      "Build a logistics platform",
      "Create a logistics app",
      "I need a logistics management system",
      "Build a logistics solution",
      "Create a logistics booking system"
  ],
};
