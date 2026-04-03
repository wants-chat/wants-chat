/**
 * Electric Vehicle App Type Definition
 *
 * Complete definition for electric vehicle applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ELECTRIC_VEHICLE_APP_TYPE: AppTypeDefinition = {
  id: 'electric-vehicle',
  name: 'Electric Vehicle',
  category: 'automotive',
  description: 'Electric Vehicle platform with comprehensive management features',
  icon: 'car',

  keywords: [
      "electric vehicle",
      "electric",
      "vehicle",
      "electric software",
      "electric app",
      "electric platform",
      "electric system",
      "electric management",
      "automotive electric"
  ],

  synonyms: [
      "Electric Vehicle platform",
      "Electric Vehicle software",
      "Electric Vehicle system",
      "electric solution",
      "electric service"
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
      "Build a electric vehicle platform",
      "Create a electric vehicle app",
      "I need a electric vehicle management system",
      "Build a electric vehicle solution",
      "Create a electric vehicle booking system"
  ],
};
