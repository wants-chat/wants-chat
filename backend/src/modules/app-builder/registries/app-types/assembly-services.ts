/**
 * Assembly Services App Type Definition
 *
 * Complete definition for assembly services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ASSEMBLY_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'assembly-services',
  name: 'Assembly Services',
  category: 'services',
  description: 'Assembly Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "assembly services",
      "assembly",
      "services",
      "assembly software",
      "assembly app",
      "assembly platform",
      "assembly system",
      "assembly management",
      "services assembly"
  ],

  synonyms: [
      "Assembly Services platform",
      "Assembly Services software",
      "Assembly Services system",
      "assembly solution",
      "assembly service"
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
      "Build a assembly services platform",
      "Create a assembly services app",
      "I need a assembly services management system",
      "Build a assembly services solution",
      "Create a assembly services booking system"
  ],
};
