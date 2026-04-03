/**
 * Vdi Services App Type Definition
 *
 * Complete definition for vdi services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VDI_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'vdi-services',
  name: 'Vdi Services',
  category: 'services',
  description: 'Vdi Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "vdi services",
      "vdi",
      "services",
      "vdi software",
      "vdi app",
      "vdi platform",
      "vdi system",
      "vdi management",
      "services vdi"
  ],

  synonyms: [
      "Vdi Services platform",
      "Vdi Services software",
      "Vdi Services system",
      "vdi solution",
      "vdi service"
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
      "Build a vdi services platform",
      "Create a vdi services app",
      "I need a vdi services management system",
      "Build a vdi services solution",
      "Create a vdi services booking system"
  ],
};
