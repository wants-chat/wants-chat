/**
 * Tractor Repair App Type Definition
 *
 * Complete definition for tractor repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRACTOR_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'tractor-repair',
  name: 'Tractor Repair',
  category: 'services',
  description: 'Tractor Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "tractor repair",
      "tractor",
      "repair",
      "tractor software",
      "tractor app",
      "tractor platform",
      "tractor system",
      "tractor management",
      "services tractor"
  ],

  synonyms: [
      "Tractor Repair platform",
      "Tractor Repair software",
      "Tractor Repair system",
      "tractor solution",
      "tractor service"
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
      "Build a tractor repair platform",
      "Create a tractor repair app",
      "I need a tractor repair management system",
      "Build a tractor repair solution",
      "Create a tractor repair booking system"
  ],
};
