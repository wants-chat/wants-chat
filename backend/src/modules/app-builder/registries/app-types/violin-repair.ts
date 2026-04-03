/**
 * Violin Repair App Type Definition
 *
 * Complete definition for violin repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VIOLIN_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'violin-repair',
  name: 'Violin Repair',
  category: 'services',
  description: 'Violin Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "violin repair",
      "violin",
      "repair",
      "violin software",
      "violin app",
      "violin platform",
      "violin system",
      "violin management",
      "services violin"
  ],

  synonyms: [
      "Violin Repair platform",
      "Violin Repair software",
      "Violin Repair system",
      "violin solution",
      "violin service"
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
      "Build a violin repair platform",
      "Create a violin repair app",
      "I need a violin repair management system",
      "Build a violin repair solution",
      "Create a violin repair booking system"
  ],
};
