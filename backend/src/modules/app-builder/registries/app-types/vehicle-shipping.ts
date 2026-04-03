/**
 * Vehicle Shipping App Type Definition
 *
 * Complete definition for vehicle shipping applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VEHICLE_SHIPPING_APP_TYPE: AppTypeDefinition = {
  id: 'vehicle-shipping',
  name: 'Vehicle Shipping',
  category: 'logistics',
  description: 'Vehicle Shipping platform with comprehensive management features',
  icon: 'package',

  keywords: [
      "vehicle shipping",
      "vehicle",
      "shipping",
      "vehicle software",
      "vehicle app",
      "vehicle platform",
      "vehicle system",
      "vehicle management",
      "logistics vehicle"
  ],

  synonyms: [
      "Vehicle Shipping platform",
      "Vehicle Shipping software",
      "Vehicle Shipping system",
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
      "shipment-tracking",
      "orders",
      "invoicing",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "carrier-integration",
      "proof-of-delivery",
      "payments",
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
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a vehicle shipping platform",
      "Create a vehicle shipping app",
      "I need a vehicle shipping management system",
      "Build a vehicle shipping solution",
      "Create a vehicle shipping booking system"
  ],
};
