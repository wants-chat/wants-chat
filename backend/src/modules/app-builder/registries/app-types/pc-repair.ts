/**
 * Pc Repair App Type Definition
 *
 * Complete definition for pc repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PC_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'pc-repair',
  name: 'Pc Repair',
  category: 'services',
  description: 'Pc Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "pc repair",
      "repair",
      "pc software",
      "pc app",
      "pc platform",
      "pc system",
      "pc management",
      "services pc"
  ],

  synonyms: [
      "Pc Repair platform",
      "Pc Repair software",
      "Pc Repair system",
      "pc solution",
      "pc service"
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
      "Build a pc repair platform",
      "Create a pc repair app",
      "I need a pc repair management system",
      "Build a pc repair solution",
      "Create a pc repair booking system"
  ],
};
