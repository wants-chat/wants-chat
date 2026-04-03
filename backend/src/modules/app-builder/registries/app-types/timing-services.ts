/**
 * Timing Services App Type Definition
 *
 * Complete definition for timing services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TIMING_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'timing-services',
  name: 'Timing Services',
  category: 'services',
  description: 'Timing Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "timing services",
      "timing",
      "services",
      "timing software",
      "timing app",
      "timing platform",
      "timing system",
      "timing management",
      "services timing"
  ],

  synonyms: [
      "Timing Services platform",
      "Timing Services software",
      "Timing Services system",
      "timing solution",
      "timing service"
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
      "Build a timing services platform",
      "Create a timing services app",
      "I need a timing services management system",
      "Build a timing services solution",
      "Create a timing services booking system"
  ],
};
