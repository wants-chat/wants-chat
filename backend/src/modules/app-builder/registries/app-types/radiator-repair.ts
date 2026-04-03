/**
 * Radiator Repair App Type Definition
 *
 * Complete definition for radiator repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RADIATOR_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'radiator-repair',
  name: 'Radiator Repair',
  category: 'services',
  description: 'Radiator Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "radiator repair",
      "radiator",
      "repair",
      "radiator software",
      "radiator app",
      "radiator platform",
      "radiator system",
      "radiator management",
      "services radiator"
  ],

  synonyms: [
      "Radiator Repair platform",
      "Radiator Repair software",
      "Radiator Repair system",
      "radiator solution",
      "radiator service"
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
      "Build a radiator repair platform",
      "Create a radiator repair app",
      "I need a radiator repair management system",
      "Build a radiator repair solution",
      "Create a radiator repair booking system"
  ],
};
