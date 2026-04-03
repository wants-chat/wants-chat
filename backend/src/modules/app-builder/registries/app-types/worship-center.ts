/**
 * Worship Center App Type Definition
 *
 * Complete definition for worship center applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WORSHIP_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'worship-center',
  name: 'Worship Center',
  category: 'logistics',
  description: 'Worship Center platform with comprehensive management features',
  icon: 'truck',

  keywords: [
      "worship center",
      "worship",
      "center",
      "worship software",
      "worship app",
      "worship platform",
      "worship system",
      "worship management",
      "logistics worship"
  ],

  synonyms: [
      "Worship Center platform",
      "Worship Center software",
      "Worship Center system",
      "worship solution",
      "worship service"
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
      "Build a worship center platform",
      "Create a worship center app",
      "I need a worship center management system",
      "Build a worship center solution",
      "Create a worship center booking system"
  ],
};
