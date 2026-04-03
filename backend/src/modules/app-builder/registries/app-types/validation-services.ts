/**
 * Validation Services App Type Definition
 *
 * Complete definition for validation services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VALIDATION_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'validation-services',
  name: 'Validation Services',
  category: 'services',
  description: 'Validation Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "validation services",
      "validation",
      "services",
      "validation software",
      "validation app",
      "validation platform",
      "validation system",
      "validation management",
      "services validation"
  ],

  synonyms: [
      "Validation Services platform",
      "Validation Services software",
      "Validation Services system",
      "validation solution",
      "validation service"
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
      "Build a validation services platform",
      "Create a validation services app",
      "I need a validation services management system",
      "Build a validation services solution",
      "Create a validation services booking system"
  ],
};
