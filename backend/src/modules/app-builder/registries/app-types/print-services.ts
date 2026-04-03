/**
 * Print Services App Type Definition
 *
 * Complete definition for print services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PRINT_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'print-services',
  name: 'Print Services',
  category: 'services',
  description: 'Print Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "print services",
      "print",
      "services",
      "print software",
      "print app",
      "print platform",
      "print system",
      "print management",
      "services print"
  ],

  synonyms: [
      "Print Services platform",
      "Print Services software",
      "Print Services system",
      "print solution",
      "print service"
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
      "Build a print services platform",
      "Create a print services app",
      "I need a print services management system",
      "Build a print services solution",
      "Create a print services booking system"
  ],
};
