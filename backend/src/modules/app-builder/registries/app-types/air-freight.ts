/**
 * Air Freight App Type Definition
 *
 * Complete definition for air freight applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AIR_FREIGHT_APP_TYPE: AppTypeDefinition = {
  id: 'air-freight',
  name: 'Air Freight',
  category: 'logistics',
  description: 'Air Freight platform with comprehensive management features',
  icon: 'truck',

  keywords: [
      "air freight",
      "air",
      "freight",
      "air software",
      "air app",
      "air platform",
      "air system",
      "air management",
      "logistics air"
  ],

  synonyms: [
      "Air Freight platform",
      "Air Freight software",
      "Air Freight system",
      "air solution",
      "air service"
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
      "Build a air freight platform",
      "Create a air freight app",
      "I need a air freight management system",
      "Build a air freight solution",
      "Create a air freight booking system"
  ],
};
