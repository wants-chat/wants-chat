/**
 * Residential Services App Type Definition
 *
 * Complete definition for residential services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RESIDENTIAL_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'residential-services',
  name: 'Residential Services',
  category: 'services',
  description: 'Residential Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "residential services",
      "residential",
      "services",
      "residential software",
      "residential app",
      "residential platform",
      "residential system",
      "residential management",
      "services residential"
  ],

  synonyms: [
      "Residential Services platform",
      "Residential Services software",
      "Residential Services system",
      "residential solution",
      "residential service"
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
      "Build a residential services platform",
      "Create a residential services app",
      "I need a residential services management system",
      "Build a residential services solution",
      "Create a residential services booking system"
  ],
};
