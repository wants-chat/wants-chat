/**
 * Apprenticeship App Type Definition
 *
 * Complete definition for apprenticeship applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const APPRENTICESHIP_APP_TYPE: AppTypeDefinition = {
  id: 'apprenticeship',
  name: 'Apprenticeship',
  category: 'logistics',
  description: 'Apprenticeship platform with comprehensive management features',
  icon: 'truck',

  keywords: [
      "apprenticeship",
      "apprenticeship software",
      "apprenticeship app",
      "apprenticeship platform",
      "apprenticeship system",
      "apprenticeship management",
      "logistics apprenticeship"
  ],

  synonyms: [
      "Apprenticeship platform",
      "Apprenticeship software",
      "Apprenticeship system",
      "apprenticeship solution",
      "apprenticeship service"
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
      "Build a apprenticeship platform",
      "Create a apprenticeship app",
      "I need a apprenticeship management system",
      "Build a apprenticeship solution",
      "Create a apprenticeship booking system"
  ],
};
