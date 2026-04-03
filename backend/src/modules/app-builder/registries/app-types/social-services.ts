/**
 * Social Services App Type Definition
 *
 * Complete definition for social services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SOCIAL_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'social-services',
  name: 'Social Services',
  category: 'services',
  description: 'Social Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "social services",
      "social",
      "services",
      "social software",
      "social app",
      "social platform",
      "social system",
      "social management",
      "services social"
  ],

  synonyms: [
      "Social Services platform",
      "Social Services software",
      "Social Services system",
      "social solution",
      "social service"
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
      "Build a social services platform",
      "Create a social services app",
      "I need a social services management system",
      "Build a social services solution",
      "Create a social services booking system"
  ],
};
