/**
 * Truck Repair App Type Definition
 *
 * Complete definition for truck repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRUCK_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'truck-repair',
  name: 'Truck Repair',
  category: 'services',
  description: 'Truck Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "truck repair",
      "truck",
      "repair",
      "truck software",
      "truck app",
      "truck platform",
      "truck system",
      "truck management",
      "services truck"
  ],

  synonyms: [
      "Truck Repair platform",
      "Truck Repair software",
      "Truck Repair system",
      "truck solution",
      "truck service"
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
      "Build a truck repair platform",
      "Create a truck repair app",
      "I need a truck repair management system",
      "Build a truck repair solution",
      "Create a truck repair booking system"
  ],
};
