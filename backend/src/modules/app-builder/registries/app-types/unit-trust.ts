/**
 * Unit Trust App Type Definition
 *
 * Complete definition for unit trust applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const UNIT_TRUST_APP_TYPE: AppTypeDefinition = {
  id: 'unit-trust',
  name: 'Unit Trust',
  category: 'technology',
  description: 'Unit Trust platform with comprehensive management features',
  icon: 'code',

  keywords: [
      "unit trust",
      "unit",
      "trust",
      "unit software",
      "unit app",
      "unit platform",
      "unit system",
      "unit management",
      "technology unit"
  ],

  synonyms: [
      "Unit Trust platform",
      "Unit Trust software",
      "Unit Trust system",
      "unit solution",
      "unit service"
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
      "projects",
      "tasks",
      "documents",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "time-tracking",
      "invoicing",
      "clients",
      "reporting",
      "analytics"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'technology',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a unit trust platform",
      "Create a unit trust app",
      "I need a unit trust management system",
      "Build a unit trust solution",
      "Create a unit trust booking system"
  ],
};
