/**
 * Marine Services App Type Definition
 *
 * Complete definition for marine services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MARINE_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'marine-services',
  name: 'Marine Services',
  category: 'services',
  description: 'Marine Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "marine services",
      "marine",
      "services",
      "marine software",
      "marine app",
      "marine platform",
      "marine system",
      "marine management",
      "services marine"
  ],

  synonyms: [
      "Marine Services platform",
      "Marine Services software",
      "Marine Services system",
      "marine solution",
      "marine service"
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
      "Build a marine services platform",
      "Create a marine services app",
      "I need a marine services management system",
      "Build a marine services solution",
      "Create a marine services booking system"
  ],
};
