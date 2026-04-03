/**
 * Telephone Services App Type Definition
 *
 * Complete definition for telephone services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TELEPHONE_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'telephone-services',
  name: 'Telephone Services',
  category: 'services',
  description: 'Telephone Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "telephone services",
      "telephone",
      "services",
      "telephone software",
      "telephone app",
      "telephone platform",
      "telephone system",
      "telephone management",
      "services telephone"
  ],

  synonyms: [
      "Telephone Services platform",
      "Telephone Services software",
      "Telephone Services system",
      "telephone solution",
      "telephone service"
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
      "Build a telephone services platform",
      "Create a telephone services app",
      "I need a telephone services management system",
      "Build a telephone services solution",
      "Create a telephone services booking system"
  ],
};
