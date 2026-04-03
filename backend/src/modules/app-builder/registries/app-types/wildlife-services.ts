/**
 * Wildlife Services App Type Definition
 *
 * Complete definition for wildlife services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WILDLIFE_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'wildlife-services',
  name: 'Wildlife Services',
  category: 'services',
  description: 'Wildlife Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "wildlife services",
      "wildlife",
      "services",
      "wildlife software",
      "wildlife app",
      "wildlife platform",
      "wildlife system",
      "wildlife management",
      "services wildlife"
  ],

  synonyms: [
      "Wildlife Services platform",
      "Wildlife Services software",
      "Wildlife Services system",
      "wildlife solution",
      "wildlife service"
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
      "Build a wildlife services platform",
      "Create a wildlife services app",
      "I need a wildlife services management system",
      "Build a wildlife services solution",
      "Create a wildlife services booking system"
  ],
};
