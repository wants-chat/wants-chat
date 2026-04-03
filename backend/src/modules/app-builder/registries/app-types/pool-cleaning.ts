/**
 * Pool Cleaning App Type Definition
 *
 * Complete definition for pool cleaning applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const POOL_CLEANING_APP_TYPE: AppTypeDefinition = {
  id: 'pool-cleaning',
  name: 'Pool Cleaning',
  category: 'services',
  description: 'Pool Cleaning platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "pool cleaning",
      "pool",
      "cleaning",
      "pool software",
      "pool app",
      "pool platform",
      "pool system",
      "pool management",
      "services pool"
  ],

  synonyms: [
      "Pool Cleaning platform",
      "Pool Cleaning software",
      "Pool Cleaning system",
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
      "Build a pool cleaning platform",
      "Create a pool cleaning app",
      "I need a pool cleaning management system",
      "Build a pool cleaning solution",
      "Create a pool cleaning booking system"
  ],
};
