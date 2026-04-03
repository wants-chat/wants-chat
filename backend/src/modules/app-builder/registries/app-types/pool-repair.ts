/**
 * Pool Repair App Type Definition
 *
 * Complete definition for pool repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const POOL_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'pool-repair',
  name: 'Pool Repair',
  category: 'services',
  description: 'Pool Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "pool repair",
      "pool",
      "repair",
      "pool software",
      "pool app",
      "pool platform",
      "pool system",
      "pool management",
      "services pool"
  ],

  synonyms: [
      "Pool Repair platform",
      "Pool Repair software",
      "Pool Repair system",
      "pool solution",
      "pool service"
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
      "Build a pool repair platform",
      "Create a pool repair app",
      "I need a pool repair management system",
      "Build a pool repair solution",
      "Create a pool repair booking system"
  ],
};
