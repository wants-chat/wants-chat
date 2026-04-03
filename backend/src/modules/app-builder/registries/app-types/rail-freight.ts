/**
 * Rail Freight App Type Definition
 *
 * Complete definition for rail freight applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RAIL_FREIGHT_APP_TYPE: AppTypeDefinition = {
  id: 'rail-freight',
  name: 'Rail Freight',
  category: 'logistics',
  description: 'Rail Freight platform with comprehensive management features',
  icon: 'truck',

  keywords: [
      "rail freight",
      "rail",
      "freight",
      "rail software",
      "rail app",
      "rail platform",
      "rail system",
      "rail management",
      "logistics rail"
  ],

  synonyms: [
      "Rail Freight platform",
      "Rail Freight software",
      "Rail Freight system",
      "rail solution",
      "rail service"
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
      "Build a rail freight platform",
      "Create a rail freight app",
      "I need a rail freight management system",
      "Build a rail freight solution",
      "Create a rail freight booking system"
  ],
};
