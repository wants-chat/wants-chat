/**
 * X Ray Services App Type Definition
 *
 * Complete definition for x ray services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const X_RAY_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'x-ray-services',
  name: 'X Ray Services',
  category: 'services',
  description: 'X Ray Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "x ray services",
      "ray",
      "services",
      "x software",
      "x app",
      "x platform",
      "x system",
      "x management",
      "services x"
  ],

  synonyms: [
      "X Ray Services platform",
      "X Ray Services software",
      "X Ray Services system",
      "x solution",
      "x service"
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
      "Build a x ray services platform",
      "Create a x ray services app",
      "I need a x ray services management system",
      "Build a x ray services solution",
      "Create a x ray services booking system"
  ],
};
