/**
 * Zamboni Services App Type Definition
 *
 * Complete definition for zamboni services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ZAMBONI_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'zamboni-services',
  name: 'Zamboni Services',
  category: 'services',
  description: 'Zamboni Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "zamboni services",
      "zamboni",
      "services",
      "zamboni software",
      "zamboni app",
      "zamboni platform",
      "zamboni system",
      "zamboni management",
      "services zamboni"
  ],

  synonyms: [
      "Zamboni Services platform",
      "Zamboni Services software",
      "Zamboni Services system",
      "zamboni solution",
      "zamboni service"
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
      "Build a zamboni services platform",
      "Create a zamboni services app",
      "I need a zamboni services management system",
      "Build a zamboni services solution",
      "Create a zamboni services booking system"
  ],
};
