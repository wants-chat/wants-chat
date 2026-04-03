/**
 * Archival Services App Type Definition
 *
 * Complete definition for archival services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ARCHIVAL_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'archival-services',
  name: 'Archival Services',
  category: 'services',
  description: 'Archival Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "archival services",
      "archival",
      "services",
      "archival software",
      "archival app",
      "archival platform",
      "archival system",
      "archival management",
      "services archival"
  ],

  synonyms: [
      "Archival Services platform",
      "Archival Services software",
      "Archival Services system",
      "archival solution",
      "archival service"
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
      "Build a archival services platform",
      "Create a archival services app",
      "I need a archival services management system",
      "Build a archival services solution",
      "Create a archival services booking system"
  ],
};
