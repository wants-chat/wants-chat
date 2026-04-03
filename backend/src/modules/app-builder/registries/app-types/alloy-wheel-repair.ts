/**
 * Alloy Wheel Repair App Type Definition
 *
 * Complete definition for alloy wheel repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ALLOY_WHEEL_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'alloy-wheel-repair',
  name: 'Alloy Wheel Repair',
  category: 'services',
  description: 'Alloy Wheel Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "alloy wheel repair",
      "alloy",
      "wheel",
      "repair",
      "alloy software",
      "alloy app",
      "alloy platform",
      "alloy system",
      "alloy management",
      "services alloy"
  ],

  synonyms: [
      "Alloy Wheel Repair platform",
      "Alloy Wheel Repair software",
      "Alloy Wheel Repair system",
      "alloy solution",
      "alloy service"
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
      "Build a alloy wheel repair platform",
      "Create a alloy wheel repair app",
      "I need a alloy wheel repair management system",
      "Build a alloy wheel repair solution",
      "Create a alloy wheel repair booking system"
  ],
};
