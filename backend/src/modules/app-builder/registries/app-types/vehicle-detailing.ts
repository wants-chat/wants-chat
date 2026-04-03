/**
 * Vehicle Detailing App Type Definition
 *
 * Complete definition for vehicle detailing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VEHICLE_DETAILING_APP_TYPE: AppTypeDefinition = {
  id: 'vehicle-detailing',
  name: 'Vehicle Detailing',
  category: 'automotive',
  description: 'Vehicle Detailing platform with comprehensive management features',
  icon: 'car',

  keywords: [
      "vehicle detailing",
      "vehicle",
      "detailing",
      "vehicle software",
      "vehicle app",
      "vehicle platform",
      "vehicle system",
      "vehicle management",
      "automotive vehicle"
  ],

  synonyms: [
      "Vehicle Detailing platform",
      "Vehicle Detailing software",
      "Vehicle Detailing system",
      "vehicle solution",
      "vehicle service"
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
      "Build a vehicle detailing platform",
      "Create a vehicle detailing app",
      "I need a vehicle detailing management system",
      "Build a vehicle detailing solution",
      "Create a vehicle detailing booking system"
  ],
};
