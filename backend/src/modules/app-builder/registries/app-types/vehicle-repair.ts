/**
 * Vehicle Repair App Type Definition
 *
 * Complete definition for vehicle repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VEHICLE_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'vehicle-repair',
  name: 'Vehicle Repair',
  category: 'services',
  description: 'Vehicle Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "vehicle repair",
      "vehicle",
      "repair",
      "vehicle software",
      "vehicle app",
      "vehicle platform",
      "vehicle system",
      "vehicle management",
      "services vehicle"
  ],

  synonyms: [
      "Vehicle Repair platform",
      "Vehicle Repair software",
      "Vehicle Repair system",
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
      "appointments",
      "scheduling",
      "invoicing",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "inventory",
      "payments",
      "reviews",
      "clients",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a vehicle repair platform",
      "Create a vehicle repair app",
      "I need a vehicle repair management system",
      "Build a vehicle repair solution",
      "Create a vehicle repair booking system"
  ],
};
