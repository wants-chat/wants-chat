/**
 * Packaging Services App Type Definition
 *
 * Complete definition for packaging services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PACKAGING_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'packaging-services',
  name: 'Packaging Services',
  category: 'services',
  description: 'Packaging Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "packaging services",
      "packaging",
      "services",
      "packaging software",
      "packaging app",
      "packaging platform",
      "packaging system",
      "packaging management",
      "services packaging"
  ],

  synonyms: [
      "Packaging Services platform",
      "Packaging Services software",
      "Packaging Services system",
      "packaging solution",
      "packaging service"
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
      "Build a packaging services platform",
      "Create a packaging services app",
      "I need a packaging services management system",
      "Build a packaging services solution",
      "Create a packaging services booking system"
  ],
};
