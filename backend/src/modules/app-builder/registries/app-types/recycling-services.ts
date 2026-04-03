/**
 * Recycling Services App Type Definition
 *
 * Complete definition for recycling services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RECYCLING_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'recycling-services',
  name: 'Recycling Services',
  category: 'services',
  description: 'Recycling Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "recycling services",
      "recycling",
      "services",
      "recycling software",
      "recycling app",
      "recycling platform",
      "recycling system",
      "recycling management",
      "services recycling"
  ],

  synonyms: [
      "Recycling Services platform",
      "Recycling Services software",
      "Recycling Services system",
      "recycling solution",
      "recycling service"
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
      "Build a recycling services platform",
      "Create a recycling services app",
      "I need a recycling services management system",
      "Build a recycling services solution",
      "Create a recycling services booking system"
  ],
};
