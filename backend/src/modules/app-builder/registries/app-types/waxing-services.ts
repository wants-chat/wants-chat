/**
 * Waxing Services App Type Definition
 *
 * Complete definition for waxing services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WAXING_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'waxing-services',
  name: 'Waxing Services',
  category: 'services',
  description: 'Waxing Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "waxing services",
      "waxing",
      "services",
      "waxing software",
      "waxing app",
      "waxing platform",
      "waxing system",
      "waxing management",
      "services waxing"
  ],

  synonyms: [
      "Waxing Services platform",
      "Waxing Services software",
      "Waxing Services system",
      "waxing solution",
      "waxing service"
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
      "Build a waxing services platform",
      "Create a waxing services app",
      "I need a waxing services management system",
      "Build a waxing services solution",
      "Create a waxing services booking system"
  ],
};
