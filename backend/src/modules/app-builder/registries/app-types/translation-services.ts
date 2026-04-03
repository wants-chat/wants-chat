/**
 * Translation Services App Type Definition
 *
 * Complete definition for translation services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRANSLATION_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'translation-services',
  name: 'Translation Services',
  category: 'services',
  description: 'Translation Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "translation services",
      "translation",
      "services",
      "translation software",
      "translation app",
      "translation platform",
      "translation system",
      "translation management",
      "services translation"
  ],

  synonyms: [
      "Translation Services platform",
      "Translation Services software",
      "Translation Services system",
      "translation solution",
      "translation service"
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
      "Build a translation services platform",
      "Create a translation services app",
      "I need a translation services management system",
      "Build a translation services solution",
      "Create a translation services booking system"
  ],
};
