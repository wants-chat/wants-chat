/**
 * Translation Agency App Type Definition
 *
 * Complete definition for translation agency applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRANSLATION_AGENCY_APP_TYPE: AppTypeDefinition = {
  id: 'translation-agency',
  name: 'Translation Agency',
  category: 'services',
  description: 'Translation Agency platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "translation agency",
      "translation",
      "agency",
      "translation software",
      "translation app",
      "translation platform",
      "translation system",
      "translation management",
      "services translation"
  ],

  synonyms: [
      "Translation Agency platform",
      "Translation Agency software",
      "Translation Agency system",
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
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a translation agency platform",
      "Create a translation agency app",
      "I need a translation agency management system",
      "Build a translation agency solution",
      "Create a translation agency booking system"
  ],
};
