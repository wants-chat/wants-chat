/**
 * Scholarship App Type Definition
 *
 * Complete definition for scholarship applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SCHOLARSHIP_APP_TYPE: AppTypeDefinition = {
  id: 'scholarship',
  name: 'Scholarship',
  category: 'logistics',
  description: 'Scholarship platform with comprehensive management features',
  icon: 'truck',

  keywords: [
      "scholarship",
      "scholarship software",
      "scholarship app",
      "scholarship platform",
      "scholarship system",
      "scholarship management",
      "logistics scholarship"
  ],

  synonyms: [
      "Scholarship platform",
      "Scholarship software",
      "Scholarship system",
      "scholarship solution",
      "scholarship service"
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
      "Build a scholarship platform",
      "Create a scholarship app",
      "I need a scholarship management system",
      "Build a scholarship solution",
      "Create a scholarship booking system"
  ],
};
