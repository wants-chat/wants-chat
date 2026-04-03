/**
 * Postal Services App Type Definition
 *
 * Complete definition for postal services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const POSTAL_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'postal-services',
  name: 'Postal Services',
  category: 'services',
  description: 'Postal Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "postal services",
      "postal",
      "services",
      "postal software",
      "postal app",
      "postal platform",
      "postal system",
      "postal management",
      "services postal"
  ],

  synonyms: [
      "Postal Services platform",
      "Postal Services software",
      "Postal Services system",
      "postal solution",
      "postal service"
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
      "Build a postal services platform",
      "Create a postal services app",
      "I need a postal services management system",
      "Build a postal services solution",
      "Create a postal services booking system"
  ],
};
