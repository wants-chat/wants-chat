/**
 * Protective Services App Type Definition
 *
 * Complete definition for protective services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PROTECTIVE_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'protective-services',
  name: 'Protective Services',
  category: 'services',
  description: 'Protective Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "protective services",
      "protective",
      "services",
      "protective software",
      "protective app",
      "protective platform",
      "protective system",
      "protective management",
      "services protective"
  ],

  synonyms: [
      "Protective Services platform",
      "Protective Services software",
      "Protective Services system",
      "protective solution",
      "protective service"
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
      "Build a protective services platform",
      "Create a protective services app",
      "I need a protective services management system",
      "Build a protective services solution",
      "Create a protective services booking system"
  ],
};
