/**
 * Adjuster Services App Type Definition
 *
 * Complete definition for adjuster services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ADJUSTER_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'adjuster-services',
  name: 'Adjuster Services',
  category: 'services',
  description: 'Adjuster Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "adjuster services",
      "adjuster",
      "services",
      "adjuster software",
      "adjuster app",
      "adjuster platform",
      "adjuster system",
      "adjuster management",
      "services adjuster"
  ],

  synonyms: [
      "Adjuster Services platform",
      "Adjuster Services software",
      "Adjuster Services system",
      "adjuster solution",
      "adjuster service"
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
      "Build a adjuster services platform",
      "Create a adjuster services app",
      "I need a adjuster services management system",
      "Build a adjuster services solution",
      "Create a adjuster services booking system"
  ],
};
