/**
 * Weighing Services App Type Definition
 *
 * Complete definition for weighing services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WEIGHING_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'weighing-services',
  name: 'Weighing Services',
  category: 'services',
  description: 'Weighing Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "weighing services",
      "weighing",
      "services",
      "weighing software",
      "weighing app",
      "weighing platform",
      "weighing system",
      "weighing management",
      "services weighing"
  ],

  synonyms: [
      "Weighing Services platform",
      "Weighing Services software",
      "Weighing Services system",
      "weighing solution",
      "weighing service"
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
      "Build a weighing services platform",
      "Create a weighing services app",
      "I need a weighing services management system",
      "Build a weighing services solution",
      "Create a weighing services booking system"
  ],
};
