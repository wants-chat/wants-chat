/**
 * Wireless Services App Type Definition
 *
 * Complete definition for wireless services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WIRELESS_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'wireless-services',
  name: 'Wireless Services',
  category: 'services',
  description: 'Wireless Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "wireless services",
      "wireless",
      "services",
      "wireless software",
      "wireless app",
      "wireless platform",
      "wireless system",
      "wireless management",
      "services wireless"
  ],

  synonyms: [
      "Wireless Services platform",
      "Wireless Services software",
      "Wireless Services system",
      "wireless solution",
      "wireless service"
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
      "Build a wireless services platform",
      "Create a wireless services app",
      "I need a wireless services management system",
      "Build a wireless services solution",
      "Create a wireless services booking system"
  ],
};
