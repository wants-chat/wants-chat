/**
 * Amplifier Repair App Type Definition
 *
 * Complete definition for amplifier repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AMPLIFIER_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'amplifier-repair',
  name: 'Amplifier Repair',
  category: 'services',
  description: 'Amplifier Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "amplifier repair",
      "amplifier",
      "repair",
      "amplifier software",
      "amplifier app",
      "amplifier platform",
      "amplifier system",
      "amplifier management",
      "services amplifier"
  ],

  synonyms: [
      "Amplifier Repair platform",
      "Amplifier Repair software",
      "Amplifier Repair system",
      "amplifier solution",
      "amplifier service"
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
      "Build a amplifier repair platform",
      "Create a amplifier repair app",
      "I need a amplifier repair management system",
      "Build a amplifier repair solution",
      "Create a amplifier repair booking system"
  ],
};
