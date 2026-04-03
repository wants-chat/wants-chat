/**
 * Investigation Services App Type Definition
 *
 * Complete definition for investigation services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const INVESTIGATION_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'investigation-services',
  name: 'Investigation Services',
  category: 'services',
  description: 'Investigation Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "investigation services",
      "investigation",
      "services",
      "investigation software",
      "investigation app",
      "investigation platform",
      "investigation system",
      "investigation management",
      "services investigation"
  ],

  synonyms: [
      "Investigation Services platform",
      "Investigation Services software",
      "Investigation Services system",
      "investigation solution",
      "investigation service"
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
      "Build a investigation services platform",
      "Create a investigation services app",
      "I need a investigation services management system",
      "Build a investigation services solution",
      "Create a investigation services booking system"
  ],
};
