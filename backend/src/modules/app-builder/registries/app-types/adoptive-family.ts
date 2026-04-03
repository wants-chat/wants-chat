/**
 * Adoptive Family App Type Definition
 *
 * Complete definition for adoptive family applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ADOPTIVE_FAMILY_APP_TYPE: AppTypeDefinition = {
  id: 'adoptive-family',
  name: 'Adoptive Family',
  category: 'services',
  description: 'Adoptive Family platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "adoptive family",
      "adoptive",
      "family",
      "adoptive software",
      "adoptive app",
      "adoptive platform",
      "adoptive system",
      "adoptive management",
      "services adoptive"
  ],

  synonyms: [
      "Adoptive Family platform",
      "Adoptive Family software",
      "Adoptive Family system",
      "adoptive solution",
      "adoptive service"
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
      "Build a adoptive family platform",
      "Create a adoptive family app",
      "I need a adoptive family management system",
      "Build a adoptive family solution",
      "Create a adoptive family booking system"
  ],
};
