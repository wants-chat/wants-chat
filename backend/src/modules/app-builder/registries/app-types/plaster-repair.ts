/**
 * Plaster Repair App Type Definition
 *
 * Complete definition for plaster repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PLASTER_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'plaster-repair',
  name: 'Plaster Repair',
  category: 'services',
  description: 'Plaster Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "plaster repair",
      "plaster",
      "repair",
      "plaster software",
      "plaster app",
      "plaster platform",
      "plaster system",
      "plaster management",
      "services plaster"
  ],

  synonyms: [
      "Plaster Repair platform",
      "Plaster Repair software",
      "Plaster Repair system",
      "plaster solution",
      "plaster service"
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
      "Build a plaster repair platform",
      "Create a plaster repair app",
      "I need a plaster repair management system",
      "Build a plaster repair solution",
      "Create a plaster repair booking system"
  ],
};
