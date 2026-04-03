/**
 * Freight Forwarding App Type Definition
 *
 * Complete definition for freight forwarding applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FREIGHT_FORWARDING_APP_TYPE: AppTypeDefinition = {
  id: 'freight-forwarding',
  name: 'Freight Forwarding',
  category: 'logistics',
  description: 'Freight Forwarding platform with comprehensive management features',
  icon: 'truck',

  keywords: [
      "freight forwarding",
      "freight",
      "forwarding",
      "freight software",
      "freight app",
      "freight platform",
      "freight system",
      "freight management",
      "logistics freight"
  ],

  synonyms: [
      "Freight Forwarding platform",
      "Freight Forwarding software",
      "Freight Forwarding system",
      "freight solution",
      "freight service"
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
      "Build a freight forwarding platform",
      "Create a freight forwarding app",
      "I need a freight forwarding management system",
      "Build a freight forwarding solution",
      "Create a freight forwarding booking system"
  ],
};
