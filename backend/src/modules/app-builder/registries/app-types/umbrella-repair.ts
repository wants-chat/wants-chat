/**
 * Umbrella Repair App Type Definition
 *
 * Complete definition for umbrella repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const UMBRELLA_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'umbrella-repair',
  name: 'Umbrella Repair',
  category: 'services',
  description: 'Umbrella Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "umbrella repair",
      "umbrella",
      "repair",
      "umbrella software",
      "umbrella app",
      "umbrella platform",
      "umbrella system",
      "umbrella management",
      "services umbrella"
  ],

  synonyms: [
      "Umbrella Repair platform",
      "Umbrella Repair software",
      "Umbrella Repair system",
      "umbrella solution",
      "umbrella service"
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
      "Build a umbrella repair platform",
      "Create a umbrella repair app",
      "I need a umbrella repair management system",
      "Build a umbrella repair solution",
      "Create a umbrella repair booking system"
  ],
};
