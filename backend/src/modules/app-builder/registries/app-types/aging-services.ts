/**
 * Aging Services App Type Definition
 *
 * Complete definition for aging services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AGING_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'aging-services',
  name: 'Aging Services',
  category: 'services',
  description: 'Aging Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "aging services",
      "aging",
      "services",
      "aging software",
      "aging app",
      "aging platform",
      "aging system",
      "aging management",
      "services aging"
  ],

  synonyms: [
      "Aging Services platform",
      "Aging Services software",
      "Aging Services system",
      "aging solution",
      "aging service"
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
      "Build a aging services platform",
      "Create a aging services app",
      "I need a aging services management system",
      "Build a aging services solution",
      "Create a aging services booking system"
  ],
};
