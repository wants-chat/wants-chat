/**
 * Nanny Services App Type Definition
 *
 * Complete definition for nanny services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const NANNY_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'nanny-services',
  name: 'Nanny Services',
  category: 'services',
  description: 'Nanny Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "nanny services",
      "nanny",
      "services",
      "nanny software",
      "nanny app",
      "nanny platform",
      "nanny system",
      "nanny management",
      "services nanny"
  ],

  synonyms: [
      "Nanny Services platform",
      "Nanny Services software",
      "Nanny Services system",
      "nanny solution",
      "nanny service"
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
      "Build a nanny services platform",
      "Create a nanny services app",
      "I need a nanny services management system",
      "Build a nanny services solution",
      "Create a nanny services booking system"
  ],
};
