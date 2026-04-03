/**
 * Parking Garage App Type Definition
 *
 * Complete definition for parking garage applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PARKING_GARAGE_APP_TYPE: AppTypeDefinition = {
  id: 'parking-garage',
  name: 'Parking Garage',
  category: 'automotive',
  description: 'Parking Garage platform with comprehensive management features',
  icon: 'car',

  keywords: [
      "parking garage",
      "parking",
      "garage",
      "parking software",
      "parking app",
      "parking platform",
      "parking system",
      "parking management",
      "automotive parking"
  ],

  synonyms: [
      "Parking Garage platform",
      "Parking Garage software",
      "Parking Garage system",
      "parking solution",
      "parking service"
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
      "Build a parking garage platform",
      "Create a parking garage app",
      "I need a parking garage management system",
      "Build a parking garage solution",
      "Create a parking garage booking system"
  ],
};
