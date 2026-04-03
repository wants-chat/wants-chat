/**
 * Toy Repair App Type Definition
 *
 * Complete definition for toy repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TOY_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'toy-repair',
  name: 'Toy Repair',
  category: 'services',
  description: 'Toy Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "toy repair",
      "toy",
      "repair",
      "toy software",
      "toy app",
      "toy platform",
      "toy system",
      "toy management",
      "services toy"
  ],

  synonyms: [
      "Toy Repair platform",
      "Toy Repair software",
      "Toy Repair system",
      "toy solution",
      "toy service"
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
      "Build a toy repair platform",
      "Create a toy repair app",
      "I need a toy repair management system",
      "Build a toy repair solution",
      "Create a toy repair booking system"
  ],
};
