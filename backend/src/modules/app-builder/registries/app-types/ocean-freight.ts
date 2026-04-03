/**
 * Ocean Freight App Type Definition
 *
 * Complete definition for ocean freight applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const OCEAN_FREIGHT_APP_TYPE: AppTypeDefinition = {
  id: 'ocean-freight',
  name: 'Ocean Freight',
  category: 'logistics',
  description: 'Ocean Freight platform with comprehensive management features',
  icon: 'truck',

  keywords: [
      "ocean freight",
      "ocean",
      "freight",
      "ocean software",
      "ocean app",
      "ocean platform",
      "ocean system",
      "ocean management",
      "logistics ocean"
  ],

  synonyms: [
      "Ocean Freight platform",
      "Ocean Freight software",
      "Ocean Freight system",
      "ocean solution",
      "ocean service"
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
      "Build a ocean freight platform",
      "Create a ocean freight app",
      "I need a ocean freight management system",
      "Build a ocean freight solution",
      "Create a ocean freight booking system"
  ],
};
