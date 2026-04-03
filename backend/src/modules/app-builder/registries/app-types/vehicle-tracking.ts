/**
 * Vehicle Tracking App Type Definition
 *
 * Complete definition for vehicle tracking applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VEHICLE_TRACKING_APP_TYPE: AppTypeDefinition = {
  id: 'vehicle-tracking',
  name: 'Vehicle Tracking',
  category: 'automotive',
  description: 'Vehicle Tracking platform with comprehensive management features',
  icon: 'car',

  keywords: [
      "vehicle tracking",
      "vehicle",
      "tracking",
      "vehicle software",
      "vehicle app",
      "vehicle platform",
      "vehicle system",
      "vehicle management",
      "automotive vehicle"
  ],

  synonyms: [
      "Vehicle Tracking platform",
      "Vehicle Tracking software",
      "Vehicle Tracking system",
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
      "Build a vehicle tracking platform",
      "Create a vehicle tracking app",
      "I need a vehicle tracking management system",
      "Build a vehicle tracking solution",
      "Create a vehicle tracking booking system"
  ],
};
