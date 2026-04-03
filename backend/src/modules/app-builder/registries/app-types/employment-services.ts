/**
 * Employment Services App Type Definition
 *
 * Complete definition for employment services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const EMPLOYMENT_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'employment-services',
  name: 'Employment Services',
  category: 'services',
  description: 'Employment Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "employment services",
      "employment",
      "services",
      "employment software",
      "employment app",
      "employment platform",
      "employment system",
      "employment management",
      "services employment"
  ],

  synonyms: [
      "Employment Services platform",
      "Employment Services software",
      "Employment Services system",
      "employment solution",
      "employment service"
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
      "Build a employment services platform",
      "Create a employment services app",
      "I need a employment services management system",
      "Build a employment services solution",
      "Create a employment services booking system"
  ],
};
