/**
 * Utility Work App Type Definition
 *
 * Complete definition for utility work applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const UTILITY_WORK_APP_TYPE: AppTypeDefinition = {
  id: 'utility-work',
  name: 'Utility Work',
  category: 'services',
  description: 'Utility Work platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "utility work",
      "utility",
      "work",
      "utility software",
      "utility app",
      "utility platform",
      "utility system",
      "utility management",
      "services utility"
  ],

  synonyms: [
      "Utility Work platform",
      "Utility Work software",
      "Utility Work system",
      "utility solution",
      "utility service"
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
      "Build a utility work platform",
      "Create a utility work app",
      "I need a utility work management system",
      "Build a utility work solution",
      "Create a utility work booking system"
  ],
};
