/**
 * Trustee Services App Type Definition
 *
 * Complete definition for trustee services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRUSTEE_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'trustee-services',
  name: 'Trustee Services',
  category: 'services',
  description: 'Trustee Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "trustee services",
      "trustee",
      "services",
      "trustee software",
      "trustee app",
      "trustee platform",
      "trustee system",
      "trustee management",
      "services trustee"
  ],

  synonyms: [
      "Trustee Services platform",
      "Trustee Services software",
      "Trustee Services system",
      "trustee solution",
      "trustee service"
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
      "Build a trustee services platform",
      "Create a trustee services app",
      "I need a trustee services management system",
      "Build a trustee services solution",
      "Create a trustee services booking system"
  ],
};
