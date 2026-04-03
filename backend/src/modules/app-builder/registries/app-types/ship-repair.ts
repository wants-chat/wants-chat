/**
 * Ship Repair App Type Definition
 *
 * Complete definition for ship repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SHIP_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'ship-repair',
  name: 'Ship Repair',
  category: 'services',
  description: 'Ship Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "ship repair",
      "ship",
      "repair",
      "ship software",
      "ship app",
      "ship platform",
      "ship system",
      "ship management",
      "services ship"
  ],

  synonyms: [
      "Ship Repair platform",
      "Ship Repair software",
      "Ship Repair system",
      "ship solution",
      "ship service"
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
      "Build a ship repair platform",
      "Create a ship repair app",
      "I need a ship repair management system",
      "Build a ship repair solution",
      "Create a ship repair booking system"
  ],
};
