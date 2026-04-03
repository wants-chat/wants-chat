/**
 * Maid Service App Type Definition
 *
 * Complete definition for maid service applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MAID_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: 'maid-service',
  name: 'Maid Service',
  category: 'services',
  description: 'Maid Service platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "maid service",
      "maid",
      "service",
      "maid software",
      "maid app",
      "maid platform",
      "maid system",
      "maid management",
      "services maid"
  ],

  synonyms: [
      "Maid Service platform",
      "Maid Service software",
      "Maid Service system",
      "maid solution",
      "maid service"
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
      "Build a maid service platform",
      "Create a maid service app",
      "I need a maid service management system",
      "Build a maid service solution",
      "Create a maid service booking system"
  ],
};
