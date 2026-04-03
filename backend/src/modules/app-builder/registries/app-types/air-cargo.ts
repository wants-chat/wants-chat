/**
 * Air Cargo App Type Definition
 *
 * Complete definition for air cargo applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AIR_CARGO_APP_TYPE: AppTypeDefinition = {
  id: 'air-cargo',
  name: 'Air Cargo',
  category: 'automotive',
  description: 'Air Cargo platform with comprehensive management features',
  icon: 'car',

  keywords: [
      "air cargo",
      "air",
      "cargo",
      "air software",
      "air app",
      "air platform",
      "air system",
      "air management",
      "automotive air"
  ],

  synonyms: [
      "Air Cargo platform",
      "Air Cargo software",
      "Air Cargo system",
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
      "vehicle-inventory",
      "appointments",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "service-scheduling",
      "parts-catalog",
      "invoicing",
      "payments",
      "reviews"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'automotive',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
      "Build a air cargo platform",
      "Create a air cargo app",
      "I need a air cargo management system",
      "Build a air cargo solution",
      "Create a air cargo booking system"
  ],
};
