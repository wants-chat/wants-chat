/**
 * Car Leasing App Type Definition
 *
 * Complete definition for car leasing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CAR_LEASING_APP_TYPE: AppTypeDefinition = {
  id: 'car-leasing',
  name: 'Car Leasing',
  category: 'automotive',
  description: 'Car Leasing platform with comprehensive management features',
  icon: 'car',

  keywords: [
      "car leasing",
      "car",
      "leasing",
      "car software",
      "car app",
      "car platform",
      "car system",
      "car management",
      "automotive car"
  ],

  synonyms: [
      "Car Leasing platform",
      "Car Leasing software",
      "Car Leasing system",
      "car solution",
      "car service"
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
      "Build a car leasing platform",
      "Create a car leasing app",
      "I need a car leasing management system",
      "Build a car leasing solution",
      "Create a car leasing booking system"
  ],
};
