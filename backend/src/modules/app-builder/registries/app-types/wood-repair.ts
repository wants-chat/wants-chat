/**
 * Wood Repair App Type Definition
 *
 * Complete definition for wood repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WOOD_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'wood-repair',
  name: 'Wood Repair',
  category: 'services',
  description: 'Wood Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "wood repair",
      "wood",
      "repair",
      "wood software",
      "wood app",
      "wood platform",
      "wood system",
      "wood management",
      "services wood"
  ],

  synonyms: [
      "Wood Repair platform",
      "Wood Repair software",
      "Wood Repair system",
      "wood solution",
      "wood service"
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
      "Build a wood repair platform",
      "Create a wood repair app",
      "I need a wood repair management system",
      "Build a wood repair solution",
      "Create a wood repair booking system"
  ],
};
