/**
 * Zakat Services App Type Definition
 *
 * Complete definition for zakat services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ZAKAT_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'zakat-services',
  name: 'Zakat Services',
  category: 'services',
  description: 'Zakat Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "zakat services",
      "zakat",
      "services",
      "zakat software",
      "zakat app",
      "zakat platform",
      "zakat system",
      "zakat management",
      "services zakat"
  ],

  synonyms: [
      "Zakat Services platform",
      "Zakat Services software",
      "Zakat Services system",
      "zakat solution",
      "zakat service"
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
      "Build a zakat services platform",
      "Create a zakat services app",
      "I need a zakat services management system",
      "Build a zakat services solution",
      "Create a zakat services booking system"
  ],
};
