/**
 * Trucking App Type Definition
 *
 * Complete definition for trucking applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRUCKING_APP_TYPE: AppTypeDefinition = {
  id: 'trucking',
  name: 'Trucking',
  category: 'logistics',
  description: 'Trucking platform with comprehensive management features',
  icon: 'truck',

  keywords: [
      "trucking",
      "trucking software",
      "trucking app",
      "trucking platform",
      "trucking system",
      "trucking management",
      "logistics trucking"
  ],

  synonyms: [
      "Trucking platform",
      "Trucking software",
      "Trucking system",
      "trucking solution",
      "trucking service"
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
      "Build a trucking platform",
      "Create a trucking app",
      "I need a trucking management system",
      "Build a trucking solution",
      "Create a trucking booking system"
  ],
};
