/**
 * Inspection Services App Type Definition
 *
 * Complete definition for inspection services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const INSPECTION_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'inspection-services',
  name: 'Inspection Services',
  category: 'services',
  description: 'Inspection Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "inspection services",
      "inspection",
      "services",
      "inspection software",
      "inspection app",
      "inspection platform",
      "inspection system",
      "inspection management",
      "services inspection"
  ],

  synonyms: [
      "Inspection Services platform",
      "Inspection Services software",
      "Inspection Services system",
      "inspection solution",
      "inspection service"
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
      "Build a inspection services platform",
      "Create a inspection services app",
      "I need a inspection services management system",
      "Build a inspection services solution",
      "Create a inspection services booking system"
  ],
};
