/**
 * Machinery Repair App Type Definition
 *
 * Complete definition for machinery repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MACHINERY_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'machinery-repair',
  name: 'Machinery Repair',
  category: 'services',
  description: 'Machinery Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "machinery repair",
      "machinery",
      "repair",
      "machinery software",
      "machinery app",
      "machinery platform",
      "machinery system",
      "machinery management",
      "services machinery"
  ],

  synonyms: [
      "Machinery Repair platform",
      "Machinery Repair software",
      "Machinery Repair system",
      "machinery solution",
      "machinery service"
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
      "Build a machinery repair platform",
      "Create a machinery repair app",
      "I need a machinery repair management system",
      "Build a machinery repair solution",
      "Create a machinery repair booking system"
  ],
};
