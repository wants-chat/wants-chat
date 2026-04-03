/**
 * Seo Services App Type Definition
 *
 * Complete definition for seo services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SEO_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'seo-services',
  name: 'Seo Services',
  category: 'services',
  description: 'Seo Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "seo services",
      "seo",
      "services",
      "seo software",
      "seo app",
      "seo platform",
      "seo system",
      "seo management",
      "services seo"
  ],

  synonyms: [
      "Seo Services platform",
      "Seo Services software",
      "Seo Services system",
      "seo solution",
      "seo service"
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
      "Build a seo services platform",
      "Create a seo services app",
      "I need a seo services management system",
      "Build a seo services solution",
      "Create a seo services booking system"
  ],
};
