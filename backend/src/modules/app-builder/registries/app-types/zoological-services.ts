/**
 * Zoological Services App Type Definition
 *
 * Complete definition for zoological services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ZOOLOGICAL_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'zoological-services',
  name: 'Zoological Services',
  category: 'services',
  description: 'Zoological Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "zoological services",
      "zoological",
      "services",
      "zoological software",
      "zoological app",
      "zoological platform",
      "zoological system",
      "zoological management",
      "services zoological"
  ],

  synonyms: [
      "Zoological Services platform",
      "Zoological Services software",
      "Zoological Services system",
      "zoological solution",
      "zoological service"
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
      "Build a zoological services platform",
      "Create a zoological services app",
      "I need a zoological services management system",
      "Build a zoological services solution",
      "Create a zoological services booking system"
  ],
};
