/**
 * Gadget Repair App Type Definition
 *
 * Complete definition for gadget repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GADGET_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'gadget-repair',
  name: 'Gadget Repair',
  category: 'services',
  description: 'Gadget Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "gadget repair",
      "gadget",
      "repair",
      "gadget software",
      "gadget app",
      "gadget platform",
      "gadget system",
      "gadget management",
      "services gadget"
  ],

  synonyms: [
      "Gadget Repair platform",
      "Gadget Repair software",
      "Gadget Repair system",
      "gadget solution",
      "gadget service"
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
      "Build a gadget repair platform",
      "Create a gadget repair app",
      "I need a gadget repair management system",
      "Build a gadget repair solution",
      "Create a gadget repair booking system"
  ],
};
