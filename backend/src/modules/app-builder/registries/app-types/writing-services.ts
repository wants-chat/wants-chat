/**
 * Writing Services App Type Definition
 *
 * Complete definition for writing services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WRITING_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'writing-services',
  name: 'Writing Services',
  category: 'services',
  description: 'Writing Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "writing services",
      "writing",
      "services",
      "writing software",
      "writing app",
      "writing platform",
      "writing system",
      "writing management",
      "services writing"
  ],

  synonyms: [
      "Writing Services platform",
      "Writing Services software",
      "Writing Services system",
      "writing solution",
      "writing service"
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
      "Build a writing services platform",
      "Create a writing services app",
      "I need a writing services management system",
      "Build a writing services solution",
      "Create a writing services booking system"
  ],
};
