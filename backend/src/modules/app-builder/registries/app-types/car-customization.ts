/**
 * Car Customization App Type Definition
 *
 * Complete definition for car customization applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CAR_CUSTOMIZATION_APP_TYPE: AppTypeDefinition = {
  id: 'car-customization',
  name: 'Car Customization',
  category: 'automotive',
  description: 'Car Customization platform with comprehensive management features',
  icon: 'car',

  keywords: [
      "car customization",
      "car",
      "customization",
      "car software",
      "car app",
      "car platform",
      "car system",
      "car management",
      "automotive car"
  ],

  synonyms: [
      "Car Customization platform",
      "Car Customization software",
      "Car Customization system",
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
      "Build a car customization platform",
      "Create a car customization app",
      "I need a car customization management system",
      "Build a car customization solution",
      "Create a car customization booking system"
  ],
};
