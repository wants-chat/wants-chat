/**
 * Workplace Services App Type Definition
 *
 * Complete definition for workplace services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WORKPLACE_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'workplace-services',
  name: 'Workplace Services',
  category: 'services',
  description: 'Workplace Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "workplace services",
      "workplace",
      "services",
      "workplace software",
      "workplace app",
      "workplace platform",
      "workplace system",
      "workplace management",
      "services workplace"
  ],

  synonyms: [
      "Workplace Services platform",
      "Workplace Services software",
      "Workplace Services system",
      "workplace solution",
      "workplace service"
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
      "Build a workplace services platform",
      "Create a workplace services app",
      "I need a workplace services management system",
      "Build a workplace services solution",
      "Create a workplace services booking system"
  ],
};
